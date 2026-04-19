import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login/') || req.url.includes('/auth/signup/')) {
    return next(req);
  }

  const path = getRequestPath(req.url);
  const isPublicGet =
    req.method === 'GET' &&
    (
      path === '/api/subjects/' ||
      path === '/api/services/' ||
      /^\/api\/services\/\d+\/$/.test(path)
    );

  if (isPublicGet) {
    return next(req);
  }

  const access = localStorage.getItem('access')?.replace(/^"|"$/g, '');
  if (!access) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${access}`
      }
    })
  );
};

function getRequestPath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0];
  }
}
