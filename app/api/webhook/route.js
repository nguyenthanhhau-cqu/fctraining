import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@lib/actions/user";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not set");
    throw new Error(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhooks:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt?.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses } = evt?.data;

    try {
      await createOrUpdateUser(id, first_name, last_name, image_url, email_addresses);
      return new Response("User is created or updated", {
        status: 200,
      });
    } catch (err) {
      console.error("Error creating or updating user:", err);
      return new Response("Error occurred", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    try {
      const { id } = evt?.data;
      await deleteUser(id);
      return new Response("User is deleted", {
        status: 200,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      return new Response("Error occurred", {
        status: 500,
      });
    }
  }

  console.error("Unhandled event type:", eventType);
  return new Response("Unhandled event type", {
    status: 400,
  });
}