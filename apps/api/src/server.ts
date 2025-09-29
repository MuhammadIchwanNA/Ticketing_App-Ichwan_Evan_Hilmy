import app from './app';
import dotenv from 'dotenv';
import { startAllJobs } from './jobs/expirationJobs';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Start background jobs
  startAllJobs();
});