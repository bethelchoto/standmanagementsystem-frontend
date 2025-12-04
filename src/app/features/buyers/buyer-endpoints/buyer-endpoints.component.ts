import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

interface EndpointParameter {
  name: string;
  location: 'path' | 'query';
  required?: boolean;
  schema: string;
  description?: string;
}

interface EndpointResponse {
  status: string;
  description: string;
}

interface EndpointOperation {
  method: HttpMethod;
  summary: string;
  tags: string[];
  security?: string[];
  requestBody?: string;
  parameters?: EndpointParameter[];
  responses: EndpointResponse[];
}

interface BuyerEndpoint {
  path: string;
  operations: EndpointOperation[];
}

@Component({
  selector: 'app-buyer-endpoints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyer-endpoints.component.html',
  styleUrls: ['./buyer-endpoints.component.css']
})
export class BuyerEndpointsComponent {
  protected readonly endpoints: BuyerEndpoint[] = [
    {
      path: '/api/buyer/stands',
      operations: [
        {
          method: 'GET',
          summary: 'Public stand catalog',
          tags: ['Buyer - Stands'],
          responses: [
            {
              status: '200',
              description: 'Returns { success, data: Stand[] }'
            }
          ]
        }
      ]
    },
    {
      path: '/api/buyer/stands/{standId}',
      operations: [
        {
          method: 'GET',
          summary: 'Public stand detail',
          tags: ['Buyer - Stands'],
          parameters: [
            {
              name: 'standId',
              location: 'path',
              required: true,
              schema: 'string (uuid)'
            }
          ],
          responses: [
            { status: '200', description: 'Stand detail' },
            { status: '404', description: 'Stand not found' }
          ]
        }
      ]
    },
    {
      path: '/api/buyer/inquiries',
      operations: [
        {
          method: 'GET',
          summary: 'Buyer inquiries',
          tags: ['Buyer - Inquiries'],
          security: ['BearerAuth'],
          responses: [{ status: '200', description: 'List buyer inquiries' }]
        },
        {
          method: 'POST',
          summary: 'Create buyer inquiry',
          tags: ['Buyer - Inquiries'],
          security: ['BearerAuth'],
          requestBody: 'CreateInquiryRequest',
          responses: [{ status: '201', description: 'Inquiry created' }]
        }
      ]
    },
    {
      path: '/api/buyer/payment-plans',
      operations: [
        {
          method: 'GET',
          summary: 'List payment plans',
          tags: ['Buyer - Payments'],
          security: ['BearerAuth'],
          responses: [{ status: '200', description: 'Payment plans list' }]
        }
      ]
    },
    {
      path: '/api/buyer/payment-plans/{paymentPlanId}',
      operations: [
        {
          method: 'GET',
          summary: 'Payment plan detail',
          tags: ['Buyer - Payments'],
          security: ['BearerAuth'],
          parameters: [
            {
              name: 'paymentPlanId',
              location: 'path',
              required: true,
              schema: 'string (uuid)'
            }
          ],
          responses: [
            { status: '200', description: 'Payment plan detail' },
            { status: '404', description: 'Not found' }
          ]
        }
      ]
    },
    {
      path: '/api/buyer/payments',
      operations: [
        {
          method: 'GET',
          summary: 'Payment history',
          tags: ['Buyer - Payments'],
          security: ['BearerAuth'],
          responses: [{ status: '200', description: 'Payment history' }]
        },
        {
          method: 'POST',
          summary: 'Make payment',
          tags: ['Buyer - Payments'],
          security: ['BearerAuth'],
          requestBody: 'CreatePaymentRequest',
          responses: [
            { status: '201', description: 'Payment created' },
            { status: '400', description: 'Invalid payload' }
          ]
        }
      ]
    },
    {
      path: '/api/buyer/purchase-history',
      operations: [
        {
          method: 'GET',
          summary: 'Purchase history',
          tags: ['Buyer - Payments'],
          security: ['BearerAuth'],
          responses: [{ status: '200', description: 'Purchase list' }]
        }
      ]
    },
    {
      path: '/api/buyer/notifications',
      operations: [
        {
          method: 'GET',
          summary: 'Buyer notifications',
          tags: ['Buyer - Notifications'],
          security: ['BearerAuth'],
          parameters: [
            {
              name: 'unreadOnly',
              location: 'query',
              schema: 'boolean',
              description: 'Filter unread only'
            }
          ],
          responses: [{ status: '200', description: 'Notification list' }]
        }
      ]
    },
    {
      path: '/api/buyer/notifications/{notificationId}/read',
      operations: [
        {
          method: 'PATCH',
          summary: 'Mark notification as read',
          tags: ['Buyer - Notifications'],
          security: ['BearerAuth'],
          parameters: [
            {
              name: 'notificationId',
              location: 'path',
              required: true,
              schema: 'string (uuid)'
            }
          ],
          responses: [{ status: '200', description: 'Notification updated' }]
        }
      ]
    },
    {
      path: '/api/buyer/notifications/read-all',
      operations: [
        {
          method: 'PATCH',
          summary: 'Mark all notifications as read',
          tags: ['Buyer - Notifications'],
          security: ['BearerAuth'],
          responses: [{ status: '200', description: 'All notifications marked read' }]
        }
      ]
    }
  ];
}


