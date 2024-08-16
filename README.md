# Welcome to Mishmar!

<p align="center">
    <br>
    <img src="./client/public/favicon.ico" width="200"/>
    <br>
<p>

Mishmar is a web-based application built with Nest.js, MongoDB, TypeScript, and React with TypeScript. It streamlines the scheduling process for companies by allowing workers to submit their preferred shifts, which managers can easily organize and arrange using excel files.

Mishmar has been tested and upgraded, and is currently running successfully for two years in Ramla's court house security staff.

## Features

-   **Intuitive shift preference submission:** Workers can quickly and easily input their preferred shifts, eliminating the need for time-consuming back-and-forth communications with managers.
-   **Efficient shift organization:** Managers can export worker preferences to excel files for easy organization and arrangement of shifts.
-   **Excel import:** After organizing the shifts in excel, the manager can upload the file to the website to arrange the hours.
-   **Event creation:** Managers can create events to remind themselves and workers about upcoming events.
-   **Dynamic scheduling:** The website can accommodate the scheduling needs of any office, regardless of the complexity of the schedule.
-   **Compatibility:** Mishmar is a web-based application and is compatible with all major web browsers. The website is responsive, meaning it can be accessed on any device, including desktops, laptops, tablets, and smartphones.

## Installation

To install Mishmar, follow these steps:

1. Clone the repository to your local machine using Git:

```
git clone https://github.com/omerg864/mishmar.TS.git
```

2. Navigate to the project directory:

```
cd mishmar.TS
```

3. Install the required dependencies using the following command:

```
npm run install_dep
```

4. Create a `.env` file in the project directory and set the required environment variables. The file should have the following format:

```
MONGODB=<mongodb_uri>
DB_PORT=<port_number>
DB_TYPE=<database_type>
SITE_ADDRESS=<site_address>
NODE_ENV=<node_environment>
PORT=<port_number>
EMAIL_PASSWORD=<email_password>
EMAIL_ADDRESS=<email_address>
DB_PASSWORD=<db_password>
DB_USERNAME=<db_username>
DB_NAME=<db_name>
JWT_SECRET=<your_jwt_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
H_FILE_28=<file_himush_28_days_url>
H_FILE_29=<file_himush_29_days_url>
H_FILE_30=<file_himush_30_days_url>
H_FILE_31=<file_himush_31_days_url>
B_FILE_28=<file_bakara_28_days_url>
B_FILE_29=<file_bakara_29_days_url>
B_FILE_30=<file_bakara_30_days_url>
B_FILE_31=<file_bakara_31_days_url>
```

Replace the values with the appropriate values for your environment.

5. Start the application by staring the dev server on the client and server folders.

6. Open your web browser and navigate to `http://localhost:3000` to access the Mishmar website.

Note: Mishmar requires MongoDB to be installed and running on your system. If you do not have MongoDB installed, please visit [mongodb.com](https://www.mongodb.com/) for instructions on how to install it.
