import { Router } from "express";
import fetch from "node-fetch";
import { getToken } from "../tokenService.js";

const router = Router();

router.get("/:page?", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const token = await getToken();
    console.log("Subscription Key:", process.env.PM_SUBSCRIPTION_KEY);
    console.log("Token:", token?.substring(0, 20) + "...");

    const response = await fetch(`${process.env.PM_BASE_URL}/telematics/iso15143/fleet/${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "subscriptionKey": process.env.PM_SUBSCRIPTION_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Putzmeister API error body:", errBody);
      throw new Error(`Putzmeister API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
