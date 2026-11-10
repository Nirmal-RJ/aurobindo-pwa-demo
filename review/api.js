// Authentication is real; all discussion content remains a LOCAL DEMO.
// Do not send chat operations to the review backend until explicitly authorized.
import {createMockAPI} from './mock-api.js';
import {reviewSession} from './session.js';
export function createReviewAPI(){const session=reviewSession.current();if(!session)throw Error('Restore your review session before opening the preview.');return createMockAPI({viewerRole:session.account.role});}
