# Application-Security

In Node.js, Passport is a popular authentication middleware, offering a modular “strategy”-based approach for different auth scenarios (Local, JWT, OAuth, SAML, etc.). This document focuses on combining Passport Local for credential verification with Passport JWT for stateless session handling. The twist here is storing the JWT in an HTTP-only cookie – a tactic that mitigates some XSS risks by preventing client-side scripts from directly accessing tokens. 

Steps: 
1. Install Dependencies: npm install 
2. Load .env: with PORT, DB_URI, JWT_SECRET, etc. 
3. Run: npm start -> listens on port 3000. 
4. Access /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/profile. 
