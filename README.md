# Snowball

## Overview
This project is a web-based Minimart and Voucher System. It helps users enabling users to request products and earn vouchers while providing administrators with robust management and reporting tools.

## Built With

This project leverages the following technologies:

- ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)  
- ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge)  
- ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white&style=for-the-badge)  
- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)  
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black&style=for-the-badge)  
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)  

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Navigation Guide](#navigation-guide)
    - [For Residents](#for-residents)
    - [For Admins](#for-admins)
- [Tips for Efficient Use](#tips-for-efficient-use)
- [Features](#features)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/repo-name.git
   ```
2. Navigate to the directory:
   ```bash
   cd repo-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
## Usage

### Getting Started
To start the application locally:
```bash
npm start
```

### Accessing the Application

### Residents:
- **Sign-Up**:  
  - Register using your credentials or a Google account.  
  - Log in to access features like shopping, vouchers, missions, and auctions.

### Admins:
- **Default Admin Credentials**:  
  - **User**: `admin@gmail.com`  
  - **Password**: `12341234`  
- Access admin tools for managing users, inventory, and reports.

## Navigation Guide

### For Residents:
- **Dashboard**:  
   - View your points balance, transaction history, and pre-orders.
   - Search, browse, and add items to your cart or pre-order unavailable products.
- **Vouchers**:  
  - View voucher balance and voucher details.
  - View QR code of each voucher.
  - View redeemed voucher history.
- **Missions**:  
  - Enroll in missions to earn points or voucher.
  - Track completion statuses.
- **Auction House**:  
  - Place bids on exclusive items and track your auction history.

### For Admins:
- **User Management**:  
  - Add, edit, suspend users, and manage user roles or points.
- **Requests**:  
  - Approve or reject product and pre-order requests.
- **Missions**:  
  - Create and manage user missions and track progress.
  - Approve user mission completion.
  - Generate custom vouchers with specific rewards and expiration dates.
- **Reports**:  
  - Generate summaries of weekly requests and inventory levels.
- **Inventory**:  
  - Add, edit, and manage stock or product details.
  - View movement of Inventory log
- **Auctions**:  
  - Create, manage, and close auctions for exclusive items.

## Tips for Efficient Use
- **Residents**:  
  Check the **Missions** tab regularly for opportunities to earn rewards and points.
- **Admins**:  
  Leverage the **Reports** feature for data-driven insights into user activity and inventory trends.

## Features

### User Features
1. **Dashboard**:
   - View your current points balance.
   - Search and browse products, categorized with details like stock availability and points required.
   - Add products to your cart or pre-order unavailable items.

2. **Transaction Management**:
   - View transaction history for purchases.
   - Monitor pre-ordered items and their statuses.

3. **Voucher System**:
   - Browse available vouchers with descriptions, expiry dates, and discount details.
   - View redeemed vouchers and their usage history.

4. **Product Requests**:
   - Submit new product requests directly through the dashboard.
   - View a list of previously requested products and quantities.

5. **Missions**:
   - Enroll in missions to earn points or claim vouchers.
   - Track mission logs and completion statuses.

6. **Auction House**:
   - Participate in auctions by placing bids on exclusive items.
   - View completed auction history and details of your bids.

---

### Admin Features:

1. **User Management**:
   - Add, edit, and manage user accounts.
   - Suspend users, reset passwords, or adjust user points.
   - View detailed user information such as email, status, and assigned roles.

2. **Request Management**:
   - Approve or reject pre-ordered product requests.
   - Process product requests with clear status tracking.

3. **Mission and Voucher Management**:
   - Create and manage missions for users to participate in.
   - Track ongoing missions and edit existing ones.
   - Generate vouchers with customizable expiry dates, descriptions, and amounts.

4. **Auction Management**:
   - Create and manage active auctions for exclusive items.
   - View detailed information on bids and bidders.
   - Close auctions manually or track auction history.

5. **Inventory Management**:
   - Add new items to inventory with details like stock and points required.
   - Manage existing inventory, including editing or removing items.

6. **Report Generation**:
   - Generate comprehensive reports, including:
     - Weekly requests summaries to track demand trends.
     - Inventory summaries to monitor stock levels and product movement.

## License

Distributed under the MIT License. See `LICENSE` for more information.


