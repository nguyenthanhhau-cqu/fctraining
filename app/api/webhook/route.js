import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@lib/actions/user';

export default async function handler(req, res) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local' });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- no svix headers' });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error occurred' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { first_name, last_name, image_url, email_addresses, username } = evt.data;

    try {
      await createOrUpdateUser(id, first_name, last_name, image_url, email_addresses, username);
      return res.status(200).json({ message: 'User is created or updated' });
    } catch (err) {
      console.error('Error creating or updating user:', err);
      return res.status(500).json({ error: 'Error occurred' });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await deleteUser(id);
      return res.status(200).json({ message: 'User is deleted' });
    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Error occurred' });
    }
  }

  return res.status(400).json({ error: 'Unhandled event type' });
}