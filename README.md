# Menu AR SaaS

Plateforme SaaS pour restaurateurs permettant de proposer un menu en 3D et AR **100% web**, sans installation d’application.

- Côté restaurateur : back-office pour gérer les plats, les fichiers 3D et les QR codes du menu.
- Côté client : page menu publique accessible via QR, avec visualisation 3D et AR (Android WebXR, iOS Quick Look).

## Stack technique

- **Frontend** : Next.js (TypeScript, React), Tailwind CSS.
- **Backend** : Supabase (PostgreSQL, Auth, Storage).
- **Auth** : Better-Auth (email/password, extensible OAuth).
- **3D / AR** : `<model-viewer>` (WebXR Android, Quick Look iOS).
- **Hébergement** : Vercel.

