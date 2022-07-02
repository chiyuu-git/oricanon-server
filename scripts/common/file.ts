import { formatDate } from '@utils/date';

export const DOWNLOAD_PATH = 'public/assets/twitter-article';

export function getFileName(account: string, createdAt: Date, uri: string) {
    return `${account}@${formatDate(createdAt)}@${uri}`;
}
