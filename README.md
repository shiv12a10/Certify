# Certificate Management System

This project is a comprehensive system for certificate management. It allows admins to upload, create, and update certificates with integrated QR codes for verification, store them securely in the cloud, and automatically send generated certificates via email to users. The system also includes version history tracking, session management, and secure logout features.




## Features

- **Certificate Generation**: Admins can dynamically generate certificates from HTML/CSS, embedding QR codes for verification.
- **PDF Creation**: Converts certificate data into PDF format using PDFKit.
- **QR Code Integration**: Automatically adds a QR code on the first page of the generated certificate for easy verification.
- **AWS S3 Storage**: Stores generated certificates securely in an AWS S3 bucket and saves the link in the MongoDB database.
- **Email PDF Delivery**: Automatically sends generated certificates to users via email as PDF attachments using Nodemailer (SMTP).
- **Certificate Validity Management**: Allows admins to mark certificates as valid or invalid and track changes made by admins.
- **Single Logout**: Securely logs users out from all sessions using JWT for enhanced security.
- **Version History**: Tracks and saves changes made by admins to certificate details for accountability.

## Technologies Used

- **Node.js and Express.js** for server-side logic.
- **MongoDB** for storing certificate data and tracking changes.
- **AWS S3** for secure storage of generated certificate PDFs.
- **PDFKit** for generating PDFs from HTML/CSS content.
- **QR Code Generator** for embedding QR codes in certificates.
- **JWT (JSON Web Tokens)** for authentication and session management.
- **Nodemailer (SMTP)** for sending certificates via email.
