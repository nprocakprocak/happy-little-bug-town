import type { RequestHandler } from "express";

export function asyncHandler(fn: RequestHandler): RequestHandler;
export function asyncHandler<P>(fn: RequestHandler<P>): RequestHandler<P>;
export function asyncHandler<P, ResBody, ReqBody>(
  fn: RequestHandler<P, ResBody, ReqBody>,
): RequestHandler<P, ResBody, ReqBody>;
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
