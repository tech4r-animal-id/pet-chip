import { Elysia, t } from 'elysia';
import {
  registerOwner,
  getOwnerById,
  updateOwner,
  listOwners,
  deleteOwner,
} from '../controllers/ownerController';

export const ownerRoutes = new Elysia({ prefix: '/owners' })
  
  .post(
    '/',
    async ({ body }) => {
      const result = await registerOwner(body);
      return result;
    },
    {
      body: t.Object({
        holdingName: t.String({
          description: 'Name of the holding/farm',
          minLength: 2,
          maxLength: 200,
        }),
        holdingType: t.Union(
          [
            t.Literal('Farm'),
            t.Literal('Household'),
            t.Literal('Commercial Enterprise'),
            t.Literal('Pastoral'),
          ],
          {
            description: 'Type of holding',
          }
        ),
        ownerName: t.String({
          description: 'Full name of the owner',
          minLength: 2,
          maxLength: 150,
        }),
        contactPhone: t.Optional(
          t.String({
            description: 'Contact phone number',
            maxLength: 20,
          })
        ),
        address: t.Optional(
          t.String({
            description: 'Physical address of the holding',
          })
        ),
        areaId: t.Number({
          description: 'Administrative area ID',
          minimum: 1,
        }),
      }),
      detail: {
        tags: ['Owners'],
        summary: 'Register a new owner',
        description:
          'Register a new animal owner (holding) in the system. Holdings can be farms, households, commercial enterprises, or pastoral operations.',
        responses: {
          200: {
            description: 'Owner registered successfully',
          },
          400: {
            description: 'Validation error',
          },
          409: {
            description: 'Holding name already exists in area',
          },
        },
      },
    }
  )

  
  .get(
    '/',
    async ({ query }) => {
      const filters: any = {};
      if (query.holdingType) filters.holdingType = query.holdingType;
      if (query.status) filters.status = query.status;
      if (query.areaId) filters.areaId = parseInt(query.areaId);

      const result = await listOwners(filters);
      return result;
    },
    {
      query: t.Object({
        holdingType: t.Optional(
          t.Union([
            t.Literal('Farm'),
            t.Literal('Household'),
            t.Literal('Commercial Enterprise'),
            t.Literal('Pastoral'),
          ])
        ),
        status: t.Optional(
          t.Union([t.Literal('Active'), t.Literal('Inactive'), t.Literal('Suspended')])
        ),
        areaId: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Owners'],
        summary: 'List all owners',
        description: 'Retrieve a list of all registered owners with optional filtering by type, status, or area.',
        responses: {
          200: {
            description: 'List of owners retrieved successfully',
          },
        },
      },
    }
  )

  
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const result = await getOwnerById(parseInt(id));
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Holding ID',
        }),
      }),
      detail: {
        tags: ['Owners'],
        summary: 'Get owner by ID',
        description: 'Retrieve detailed information about a specific owner by their holding ID.',
        responses: {
          200: {
            description: 'Owner details retrieved successfully',
          },
          404: {
            description: 'Owner not found',
          },
        },
      },
    }
  )

  
  .patch(
    '/:id',
    async ({ params: { id }, body }) => {
      const result = await updateOwner(parseInt(id), body);
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Holding ID',
        }),
      }),
      body: t.Object({
        holdingName: t.Optional(
          t.String({
            description: 'Name of the holding/farm',
            minLength: 2,
            maxLength: 200,
          })
        ),
        ownerName: t.Optional(
          t.String({
            description: 'Full name of the owner',
            minLength: 2,
            maxLength: 150,
          })
        ),
        contactPhone: t.Optional(
          t.String({
            description: 'Contact phone number',
            maxLength: 20,
          })
        ),
        address: t.Optional(
          t.String({
            description: 'Physical address of the holding',
          })
        ),
        status: t.Optional(
          t.Union([t.Literal('Active'), t.Literal('Inactive'), t.Literal('Suspended')])
        ),
      }),
      detail: {
        tags: ['Owners'],
        summary: 'Update owner information',
        description: 'Partially update information for an existing owner. All fields are optional.',
        responses: {
          200: {
            description: 'Owner updated successfully',
          },
          404: {
            description: 'Owner not found',
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
      const result = await deleteOwner(parseInt(id));
      return result;
    },
    {
      params: t.Object({
        id: t.String({
          description: 'Holding ID',
        }),
      }),
      detail: {
        tags: ['Owners'],
        summary: 'Delete owner',
        description: 'Soft delete an owner by setting their status to Inactive.',
        responses: {
          200: {
            description: 'Owner deactivated successfully',
          },
          404: {
            description: 'Owner not found',
          },
        },
      },
    }
  );