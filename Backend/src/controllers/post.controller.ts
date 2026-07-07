import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinary } from "../config/cloudinary.js";
import Generation from "../models/generation.model.js";
import Post from "../models/post.model.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Generate Post
// POST /api/v1/posts/generate
export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    // 1. Generate text and ENFORCE JSON output
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", // You can also upgrade this to gemini-3.5-flash if available
      contents: `Generate a social media post based on this prompt: "${prompt}".
      Tone: ${tone}. Include relevant hashtags.
      The "imagePrompt" should be a highly descriptive prompt for an image generator that complements the post.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            content: { type: "STRING" },
            imagePrompt: { type: "STRING" },
          },
          required: ["content", "imagePrompt"],
        },
      },
    });

    let content = "";
    let imagePrompt = "";

    try {
      // Direct parsing since we enforced JSON structure
      const data = JSON.parse(textResponse.text || "{}");
      content = data.content || "";
      imagePrompt = data.imagePrompt || prompt;
    } catch (error) {
      // Fallback in case of unexpected parsing errors
      content = textResponse.text || "";
      imagePrompt = prompt;
    }

    let mediaUrl: string | undefined;

    // 2. Generate Image using the modern Interactions API
    if (generateImage && imagePrompt) {
      try {
        const interaction = await ai.interactions.create({
          model: "gemini-3.1-flash-lite-image",
          input: imagePrompt,
        });

        const generatedImage = interaction.output_image;
        let imageBase64: string | undefined;

        if (generatedImage) {
          imageBase64 = generatedImage.data;
        } else {
          throw new Error("No image data returned from Gemini");
        }

        // Upload base64 string to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/png;base64,${imageBase64}`,
          {
            folder: "ai-posts",
          },
        );

        mediaUrl = uploadResult.secure_url;
      } catch (error: any) {
        console.error("Image Generation/Upload failed:", error.message || error);
        
        // Check if it's a rate limit error (429)
        if (error?.status === 429 || error?.statusCode === 429) {
           console.log("Rate limit hit for image generation. Proceeding with text only.");
           // We do NOT return here. We let the code continue to step 3 to save the text post.
        } else {
           // For other critical errors, you might still want to fail the request
           res.status(500).json({
             message: "Failed to generate or upload the image.",
           });
        }
      }
    }

    // 3. Save to database
    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
      tone,
    });

    res.status(201).json(generation);
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      message: errorMessage,
    });
  }
};

// Get generations
// GET /api/v1/posts/generations
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(generations);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Get Posts
// GET /api/v1/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Schedule Posts
// POST /api/v1/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, scheduledFor, status } = req.body;

    // Parse platforms if it comes as a stringified array from FormData
    let parsedPlatforms = platforms;
    if (typeof platforms === "string")
      try {
        parsedPlatforms = JSON.parse(parsedPlatforms);
      } catch (e: any) {
        parsedPlatforms = platforms.split(",");
      }

    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: "image" | "video" | undefined = req.body.mediaType;

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "ai-posts",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(req.file!.buffer);
      });

      mediaUrl = result.secure_url;
      mediaType = result.resource_type === "video" ? "video" : "image";
    }
    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms,
      mediaUrl,
      mediaType,
      scheduledFor,
      status,
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
