import app from '@/app';
import CONFIG from '@/apps/config';
import { logServerInfo } from '@/utils/system-info-logs';

const startTime = Date.now();

app.listen(CONFIG.PORT, () => {
  logServerInfo(startTime);
});
