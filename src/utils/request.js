export function getEventSourceUrl(request) {
    return request.headers.get('referer') || request.headers.get('origin') || 'https://amrutbaa.com';
}

export function getClientIP(request) {
    return request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        '';
}

export function getUserAgent(request) {
    return request.headers.get('user-agent') || '';
}
