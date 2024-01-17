// pages/api/proxy/[...path].ts

import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to handle CORS
async function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    result: (error?: Error) => void
  ) => void
) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (error?: Error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Extract the URL from the query parameters
    const url = req.query.path?.[0] || req.body?.url;

    if (!url || typeof url !== "string") {
      // If URL is not provided or not a string, return a bad request response
      return res.status(400).json({ error: "Invalid URL parameter" });
    }

    // Perform the fetch with the dynamically provided URL
    const response = await fetch(url);

    // Send the fetched data back to the client
    const data = await response.text();
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in proxy route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
