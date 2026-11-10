import {restoreReviewSession,watchReviewSession} from './session-gate.js';
await restoreReviewSession();
watchReviewSession();
await import('./app.js');
document.querySelector('.review-app').hidden=false;
