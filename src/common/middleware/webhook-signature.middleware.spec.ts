// import { WebhookSignatureMiddleware } from './webhook-signature.middleware';
// import { Request, Response } from 'express';
// import { UnauthorizedException } from '@nestjs/common';
// // import * as crypto from 'crypto';

// declare module 'express' {
//   interface Request {
//     tenant?: any;
//   }
// }

// describe('WebhookSignatureMiddleware', () => {
//   let middleware: WebhookSignatureMiddleware;
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let nextFunction: jest.Mock;

//   beforeEach(() => {
//     middleware = new WebhookSignatureMiddleware();
//     mockResponse = {};
//     nextFunction = jest.fn();

//     // Mock tenant data
//     const mockTenant = {
//       id: 'test-tenant',
//       apiKeys: {
//         wooCommerce: {
//           consumerSecret: 'test-secret',
//         },
//       },
//     };

//     // Mock request with valid data
//     const payload = { order_id: 123, status: 'processing' };
//     const payloadString = JSON.stringify(payload);
//     const hmac = crypto.createHmac(
//       'sha256',
//       mockTenant.apiKeys.wooCommerce.consumerSecret,
//     );
//     const validSignature = hmac.update(payloadString).digest('base64');

//     mockRequest = {
//       headers: {
//         'x-wc-webhook-signature': validSignature,
//         'x-wc-webhook-topic': 'order.created',
//       },
//       body: payload,
//       ['tenant']: mockTenant,
//     };
//   });

//   it('should pass validation for a valid webhook signature', () => {
//     middleware.use(
//       mockRequest as Request,
//       mockResponse as Response,
//       nextFunction,
//     );
//     expect(nextFunction).toHaveBeenCalled();
//   });

//   it('should throw UnauthorizedException when signature is missing', () => {
//     delete mockRequest.headers['x-wc-webhook-signature'];
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException when topic is missing', () => {
//     delete mockRequest.headers['x-wc-webhook-topic'];
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException when tenant is missing', () => {
//     delete mockRequest['tenant'];
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException when consumerSecret is missing', () => {
//     mockRequest['tenant'].apiKeys.wooCommerce.consumerSecret = undefined;
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException for invalid signature', () => {
//     mockRequest.headers['x-wc-webhook-signature'] = 'invalid-signature';
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException when payload is modified', () => {
//     // Modify the payload after signature is generated
//     mockRequest.body.status = 'completed';
//     expect(() => {
//       middleware.use(
//         mockRequest as Request,
//         mockResponse as Response,
//         nextFunction,
//       );
//     }).toThrow(UnauthorizedException);
//   });
// });
