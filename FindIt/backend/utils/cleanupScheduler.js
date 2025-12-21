import { cleanupOldResolvedItems } from './cleanup.js';

class CleanupScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTime = '00:00';
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleNextRun();
    console.log('Cleanup scheduler started');
  }

  stop() {
    this.isRunning = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    console.log('Cleanup scheduler stopped');
  }

  scheduleNextRun() {
    if (!this.isRunning) {
      return;
    }

    const now = new Date();
    const [scheduledHour, scheduledMinute] = this.scheduledTime.split(':').map(Number);
    
    const nextRun = new Date(now);
    nextRun.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const msUntilNextRun = nextRun - now;

    this.timeout = setTimeout(async () => {
      try {
        console.log('Starting scheduled cleanup...');
        const deletedCount = await cleanupOldResolvedItems();
        console.log(`Cleanup complete. Deleted ${deletedCount} items.`);
      } catch (error) {
        console.error('Error during scheduled cleanup:', error);
      } finally {
        this.scheduleNextRun();
      }
    }, msUntilNextRun);

    console.log(`Next cleanup scheduled for: ${nextRun.toLocaleString()}`);
  }
}

const scheduler = new CleanupScheduler();
export default scheduler;