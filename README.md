# Jenna - Intelligent Content Generator

<p align="center">
  <img
  src="google-ai-hackathon-app/public/assets/banner.gif"
  alt="GitHub Profile Banner"
  width="450"
  height="auto"
  style="display: block; margin: auto;"
  />
</p>

<p>
  This project is a full-stack web application called Jenna, made as a submission for the 2024 Google AI Hackathon. The name "Jenna" is a play on the term GenAI or Generative Artificial Intelligence. The application uses the Google VertexAI API and the Google Gemini API to produce literature and art content.
</p>

<p>
  For literature content, the user has the option to enter either a sole text prompt or a combiantion of a text prompt and image alongside a selected content type - story, play, poem or song - in order to generate text content.
</p>

<p>
  For art content, the user may enter a text prompt as well as an art style - photography, oil, acrylic, watercolour, digital or sketch - and an image ratio - square, portrait or landscape - in order to generate up to 3 images.
</p>

<p>The user also has the option to authenticate a browser session with a Google account so that their content is saved.</p>

## TECHNOLOGIES USED
<ul>
	<li>Google Cloud Platform to manage cloud services - Vertex AI API, Gemini API, OAuth 2.0, Cloud Storage</li>
	<li>Next.js for the full-stack application</li>
	<li>PostgreSQL for the database</li>
</ul>

## Project Setup
<p>You need to set up the Next.js project.</p>

<p>First make sure you have <a href="https://git-scm.com/" target="_blank">Git</a> installed.</p>
<p>First make sure you have <a href="https://nodejs.org/en" target="_blank">Node</a> installed.</p>
<p>Install some type of code editor such as <a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code</a>.</p>
<p>Open Visual studio code from some secure folder in your computer and clone this repository with the following terminal command: git clone https://github.com/thelearner411/GoogleAIHackathonApp</p>
<p>Enter the Next.js app project directory by executing the following command: cd google-ai-hackathon-app</p>

<p>You will need to create some necessary Google and database credentials to make the app run smoothly.</p>
<ul>
  <li>Create a Google Cloud Project <a href="https://console.cloud.google.com/projectcreate">here</a>.</li>
  <li>Make sure to copy the project ID and location for later use.</li>
  <li>Create a <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank">service account key</a> in JSON format for the Google project. Convert the JSON content to a base64 string with the jsonToBase64 function found <a href="google-ai-hackathon-app/app/utils/DataParsing.tsx">here</a>. You will need this output string later.</li>
  <li>Go to the Google <a href="https://console.cloud.google.com/apis/credentials" target="_blank">credentials</a> page to geenrate an OAuth 2.0 Client ID for Google authentication in the Next.js application. For this credentials, add an entry under the authorised redirect URIs setting it to "http://localhost:3000/api/auth/callback/google". Copy the client ID and client secret of this credential for later use.</li>
    <li>Generate a NextAuth secret with the following terminal command: openssl rand -base64 32</li>
  <li>Create a <a href="https://aistudio.google.com/app/apikey" target="_blank">Google Gemini API Key</a>. (** Gemini is not available in all locations, so you might need to connect to a VPN to make the application work)</li>
  <li>Request access to <a href="https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview" target="_blank">Imagen</a> on Google Vertex AI.</li>
  <li>In your Google Cloud Project, create a <a href="https://console.cloud.google.com/storage" target="_blank">Storage Bucket</a> and save the name of this bucket for later use. This bucket is important to save images used in prompts as well as generated images.</li>
  <li>Install <a href="https://www.pgadmin.org/" target="_blank">pgAdmin</a> on your device and create a database with credentials to store user content metadata</li>
  <li>Install <a href="https://dbeaver.io/" target="_blank">DBeaver</a> to connect to the database using the database credentials created in the previous step.</li>
</ul>

<p>Now that all essential variables are created, it is time to set up the environment files. Create a .env file in the google-ai-hackathon-app folder and add the following variables.</p>
<p>DB_URL="Place the PostgreSQL database url here"</p>
<p>DOMAIN="http://localhost:3000"</p>
<p>GCP_CONTENT_RESULTS_BUCKET="Paste the name of the Google Cloud Storage bucket here"</p>
<p>GCP_LOCATION="Paste your GCP project location here"</p>
<p>GCP_PROJECT_ID="Paste your Google Cloud Project ID here"</p>
<p>GCP_SA_KEY_STRING="Paste your base64 string of the service account JSON here"</p>
<p>GEMINI_API_KEY="Paste your Gemini API key here"</p>
<p>GOOGLE_ID="Paste your OAuth 2.0 Client secret here"</p>
<p>GOOGLE_SECRET="Paste your OAuth 2.0 Client secret here"</p>
<p>NEXTAUTH_SECRET="Paste your Next authentication secret here"</p>
<p>NEXTAUTH_URL="http://localhost:3000"</p>

## DATABASE SETUP

<p>This project uses a PosgreSQL database with the following structure to in order to save generated content for an authenticated user</p>

<p align="center">
  <img
  src="google-ai-hackathon-app/public/assets/google-ai-hackathon-app-erd.png"
  alt="GitHub Profile Banner"
  width="450"
  height="auto"
  style="display: block; margin: auto;"
  />
</p>

<p>Connect to the database in DBeaver, open an SQL script and execute the following code to create all entity tables and relationships.</p>


### SQL CODE
<div>
create table users(
	id UUID not null primary key,
	email VARCHAR(255) not null unique,
	created_at TIMESTAMP not null,
	last_login TIMESTAMP not null
);

create table literature_content_types(
	id UUID not null primary key,
	content_type VARCHAR(255) not null
);

create table art_styles(
	id UUID not null primary key,
	style VARCHAR(255) not null
);

create table image_orientations(
	id UUID not null primary key,
	orientation VARCHAR(255) not null,
	ratio VARCHAR(3) not null
);

CREATE TABLE literature_prompts (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID not null,
    prompt TEXT NOT NULL,
    image_path TEXT NULL,
    content_type UUID NOT NULL,
    request_timestamp TIMESTAMP NOT NULL,
    response_timestamp TIMESTAMP NOT NULL,
    success INTEGER NOT null,
    warning_or_error INTEGER null,
    warning_or_error_message TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (content_type) REFERENCES literature_content_types(id),
    CHECK (
        (success = 1 AND warning_or_error IS NULL AND warning_or_error_message IS NULL) OR 
        (success = 0 AND warning_or_error IS NOT NULL AND warning_or_error_message IS NOT NULL)
    ),
    CHECK (success IN (0, 1)),
    CHECK (warning_or_error IN (1, 2))
);

CREATE TABLE art_prompts (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID not null,
    prompt TEXT NOT NULL,
    art_style UUID NOT NULL,
    orientation UUID NOT NULL,
    request_timestamp TIMESTAMP NOT NULL,
    response_timestamp TIMESTAMP NOT NULL,
    success INTEGER NOT NULL,
    warning_or_error INTEGER NULL,
    warning_or_error_message TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (art_style) REFERENCES art_styles(id),
    FOREIGN KEY (orientation) REFERENCES image_orientations(id),
    CHECK (
        (success = 1 AND warning_or_error IS NULL AND warning_or_error_message IS NULL) OR 
        (success = 0 AND warning_or_error IS NOT NULL AND warning_or_error_message IS NOT NULL)
    ),
    CHECK (success IN (0, 1)),
    CHECK (warning_or_error IN (0, 1))
);

create TABLE generated_literature(
	id UUID not null primary key,
	user_id UUID not  null,
	prompt UUID not null,
	content text not null,
	foreign key (user_id) references users(id),
	foreign key (prompt) references literature_prompts(id)
);

create TABLE generated_art(
	id UUID not null primary key,
	user_id UUID not  null,
	prompt UUID not null,
	image_no INTEGER not null,
	image_path TEXT not null,
	foreign key (user_id) references users(id),
	foreign key (prompt) references art_prompts(id)
);
</div><br><br>

<p>In order for the application to work, you need to add some look up data to some of the tables. You will need to generate a UUID7 value for each entry. You can do so here <a href="https://www.uuidgenerator.net/version7" target="_blank">here</a>.</p>

<p>Insert the following content into the literature_content_types table.</p>
<table>
  <tr>
    <th>id</th>
    <th>content_type</th>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Story</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Play</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Poem</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Song</td>
  </tr>
</table>

<p>Insert the following content into the art_styles table.</p>
<table>
  <tr>
    <th>id</th>
    <th>style</th>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Photography</td>
  </tr>
 <tr>
    <td>$generated_uuid7</td>
    <td>Oil</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Acrylic</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Watercolour</td>
  </tr>
	<tr>
    <td>$generated_uuid7</td>
    <td>Digital</td>
  </tr>
<tr>
    <td>$generated_uuid7</td>
    <td>Sketch</td>
  </tr>
</table>

<p>Insert the following content into the image_orientations table.</p>
<table>
  <tr>
    <th>id</th>
    <th>orientation</th>
	<th>ratio</th>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Square</td>
<td>1:1</td>
  </tr>
  <tr>
    <td>$generated_uuid7</td>
    <td>Photography</td>
<td>3:4</td>
  </tr>
	 <tr>
    <td>$generated_uuid7</td>
    <td>Landscape</td>
<td>4:3</td>
  </tr>
</table>

<p>Finally you can run the Next.js application with the following commands.</p>
<ul>
	<li>npm install</li>
	<li>npm run dev</li>
</ul>

<p>You should see the application running at http://localhost:3000</p>

<p>Enjoy Jenna!</p>

<p>You can see a video demo clicking on the link below. </p>

[![Watch the video demo](google-ai-hackathon-app/public/assets/logo.png)](https://www.youtube.com/watch?v=fD9OX1PmAYU "Jenna Video Demo")


<p>**NB: An isolated FastAPI backend application with the same content generation endpoints can be found <a href="https://github.com/thelearner411/GoogleAIHackathonAPI" target="_blank">here</a>.</p>
