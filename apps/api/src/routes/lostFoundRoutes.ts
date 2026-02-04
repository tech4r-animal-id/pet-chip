import { Elysia, t } from 'elysia';
import {
  createLostFoundCase,
  getLostFoundCase,
  listLostFoundCases,
  updateLostFoundCase,
  deleteLostFoundCase,
} from '../controllers/lostFoundController';

export const lostFoundRoutes = new Elysia({ prefix: '/lostfound' })
  
  .post(
    '/',
    async ({ body }) => {
      const result = await createLostFoundCase(body);
      return result;
    },
    {
      body: t.Object({
        animalId: t.String({
          description: 'UUID of the animal',
          format: 'uuid',
        }),
        reporterUserId: t.Optional(
          t.String({
            description: 'UUID of the user reporting the case',
            format: 'uuid',
          })
        ),
        message: t.String({
          description: 'Description of the situation',
          minLength: 10,
        }),
        lastSeenLat: t.Optional(
          t.Number({
            description: 'Latitude where animal was last seen',
            minimum: -90,
            maximum: 90,
          })
        ),
        lastSeenLong: t.Optional(
          t.Number({
            description: 'Longitude where animal was last seen',
            minimum: -180,
            maximum: 180,
          })
        ),
        lastSeenAddress: t.Optional(
          t.String({
            description: 'Address where animal was last seen',
          })
        ),
      }),
      detail: {
        tags: ['Lost & Found'],
        summary: 'Create lost/found case',
        description:
          'Report a lost or found animal. Include location information (coordinates or address) to help with identification.',
        responses: {
          200: {
            description: 'Lost/Found case created successfully',
          },
          400: {
            description: 'Validation error',
          },
          404: {
            description: 'Animal not found',
          },
        },
      },
    }
  )

  
  .get(
    '/',
    async ({ query }) => {
      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.animalId) filters.animalId = query.animalId;

      const result = await listLostFoundCases(filters);
      return result;
    },
    {
      query: t.Object({
        status: t.Optional(
          t.Union([t.Literal('Active'), t.Literal('Resolved'), t.Literal('False Alarm')])
        ),
        animalId: t.Optional(
          t.String({
            description: 'Filter by animal ID',
          })
        ),
      }),
      detail: {
        tags: ['Lost & Found'],
        summary: 'List lost/found cases',
        description: 'Retrieve all lost/found cases with optional filtering by status or animal.',
        responses: {
          200: {
            description: 'List retrieved successfully',
          },
        },
      },
    }
  )

  
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const result = await getLostFoundCase(id);
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Alert ID (UUID)',
          format: 'uuid',
        }),
      }),
      detail: {
        tags: ['Lost & Found'],
        summary: 'Get lost/found case',
        description: 'Retrieve detailed information about a specific lost/found case including animal information.',
        responses: {
          200: {
            description: 'Case details retrieved successfully',
          },
          404: {
            description: 'Case not found',
          },
        },
      },
    }
  )

  
  .patch(
    '/:id',
    async ({ params: { id }, body }) => {
      const result = await updateLostFoundCase(id, body);
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Alert ID (UUID)',
          format: 'uuid',
        }),
      }),
      body: t.Object({
        status: t.Optional(
          t.Union([t.Literal('Active'), t.Literal('Resolved'), t.Literal('False Alarm')])
        ),
        message: t.Optional(
          t.String({
            description: 'Updated description',
            minLength: 10,
          })
        ),
      }),
      detail: {
        tags: ['Lost & Found'],
        summary: 'Update lost/found case',
        description: 'Update the status or message of a lost/found case. Setting status to Resolved or False Alarm automatically records resolution time.',
        responses: {
          200: {
            description: 'Case updated successfully',
          },
          404: {
            description: 'Case not found',
          },
          400: {
            description: 'Validation error',
          },
        },
      },
    }
  )

  
  .delete(
    '/:id',
    async ({ params: { id } }) => {
      const result = await deleteLostFoundCase(id);
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Alert ID (UUID)',
          format: 'uuid',
        }),
      }),
      detail: {
        tags: ['Lost & Found'],
        summary: 'Delete lost/found case',
        description: 'Permanently delete a lost/found case.',
        responses: {
          200: {
            description: 'Case deleted successfully',
          },
          404: {
            description: 'Case not found',
          },
        },
      },
    }
  );