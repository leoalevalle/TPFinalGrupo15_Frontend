import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('geoapify.com') || req.url.includes('openstreetmap.org')) {
    return next(req);
  }
  const token = localStorage.getItem('token'); 

  if (token) {
    const clonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonada);
  }

  return next(req);
};