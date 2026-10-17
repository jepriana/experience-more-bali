# Deploying Experience More Bali 2027 to Google Cloud Run

This project includes a fully automated **GitHub Actions CI/CD pipeline** located at [`.github/workflows/deploy-cloud-run.yml`](.github/workflows/deploy-cloud-run.yml) that builds a production-optimized Next.js standalone container image, pushes it to **Google Artifact Registry**, and deploys it to **Google Cloud Run** in `asia-southeast2` (Jakarta, Indonesia).

---

## 1. Google Cloud Setup (One-time)

### A. Enable Required GCP APIs
In your Google Cloud Console or via `gcloud` CLI:
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iamcredentials.googleapis.com
```

### B. Create a Service Account for GitHub Actions
```bash
# 1. Create the Service Account
gcloud iam service-accounts create github-cloud-run-deployer \
  --display-name="GitHub Actions Cloud Run Deployer"

# 2. Assign Required Roles
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export SA_EMAIL="github-cloud-run-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Cloud Run Admin (to deploy and manage the service)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Artifact Registry Writer (to create repositories and push Docker images)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

# Artifact Registry Admin (to allow creating the repository if it doesn't exist)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.admin"

# Service Account User (to allow Cloud Run to run as the runtime service account)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"
```

### C. Authentication Option (Choose 1)

#### Option 1: Service Account Key (Fastest & Simplest)
Generate a JSON key file and copy its content:
```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=${SA_EMAIL}
```
Copy the full JSON contents of `key.json` to store in GitHub Secrets.

#### Option 2: Workload Identity Federation (Keyless & Recommended for Enterprise)
If you prefer keyless authentication, configure a Workload Identity Pool and Provider for GitHub:
- Set `GCP_WIF_PROVIDER` (e.g. `projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider`)
- Set `GCP_SA_EMAIL` (e.g. `github-cloud-run-deployer@${PROJECT_ID}.iam.gserviceaccount.com`)

---

## 2. GitHub Repository Configuration

In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**:

### Repository Secrets (`Secrets` tab)
| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key from Google AI Studio |
| `GCP_SA_KEY` | `{ "type": "service_account", ... }` | Full JSON key content (if using Option 1) |
| `GCP_PROJECT_ID` | `your-gcp-project-id` | Your GCP Project ID (can also be a Variable) |
| `GCP_WIF_PROVIDER` | *(Optional)* | Only if using Workload Identity Federation |
| `GCP_SA_EMAIL` | *(Optional)* | Only if using Workload Identity Federation |

### Repository Variables (`Variables` tab - Optional)
| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `GCP_REGION` | `asia-southeast2` | GCP Region (Jakarta, lowest latency to Bali) |
| `GAR_REPOSITORY` | `experience-more-bali-repo` | Artifact Registry Docker repo name |

---

## 3. Triggering Deployment

1. **Automatic on Push**:
   Any push to the `main` branch will automatically trigger the workflow.
2. **Manual Dispatch**:
   Go to your GitHub repository > **Actions** tab > **Deploy to Google Cloud Run** > click **Run workflow**.

When completed, the workflow outputs the live public **Cloud Run Service URL** directly in the GitHub Job Summary.
