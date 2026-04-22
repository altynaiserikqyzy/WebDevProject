import { HttpInterceptorFn } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  if (
    req.url.includes('/auth/login/') ||
    req.url.includes('/auth/signup/') ||
    req.url.includes('/auth/refresh/')
  ) {
    return next(req);
  }

  const path = getRequestPath(req.url);
  const isPublicGet =
    req.method === 'GET' &&
    (
      path === '/api/subjects/' ||
      path === '/api/services/' ||
      path === '/api/tutor-services/' ||
      /^\/api\/services\/\d+\/$/.test(path)
      || /^\/api\/tutor-services\/\d+\/$/.test(path)
    );

  if (isPublicGet) {
    return next(req);
  }

  const access = localStorage.getItem('access')?.replace(/^"|"$/g, '');
  if (!access) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${access}`
    }
  });

  return next(authReq).pipe(
    catchError((error) => {
      const refresh = localStorage.getItem('refresh')?.replace(/^"|"$/g, '');
      const alreadyRetried = req.headers.has('x-retry-auth');

      if (!refresh || alreadyRetried || error?.status !== 401) {
        return throwError(() => error);
      }

      return http.post<{ access: string }>('http://127.0.0.1:8000/api/auth/refresh/', { refresh }).pipe(
        switchMap((response) => {
          if (!response?.access) {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return throwError(() => error);
          }

          localStorage.setItem('access', response.access);

          const retriedReq = req.clone({
            headers: req.headers.set('x-retry-auth', '1'),
            setHeaders: {
              Authorization: `Bearer ${response.access}`
            }
          });

          return next(retriedReq);
        }),
        catchError((refreshError) => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          return throwError(() => refreshError);
        })
      );
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
