import { Elysia, t } from 'elysia';
import { lookupAnimalByChip, validateChipNumber } from '../controllers/lookupController';

export const lookupRoutes = new Elysia({ prefix: '/lookup' })
  
  .get(
    '/chip/:chipId',
    async ({ params: { chipId } }) => {
      const result = await lookupAnimalByChip(chipId);
      return result;
    },
    {
      params: t.Object({
        chipId: t.String({
          description: 'Microchip number (9-15 digits)',
          minLength: 9,
          maxLength: 15,
        }),
      }),
      detail: {
        tags: ['Lookup'],
        summary: 'Lookup animal by microchip',
        description:
          'Retrieve comprehensive animal information including current owner and ownership history using microchip number',
        responses: {
          200: {
            description: 'Animal information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    chip: {
                      type: 'object',
                      description: 'Microchip information',
                    },
                    animal: {
                      type: 'object',
                      description: 'Animal details',
                    },
                    currentHolding: {
                      type: 'object',
                      description: 'Current holding information',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Chip number not found',
          },
          400: {
            description: 'Invalid chip number format',
          },
        },
      },
    }
  )

  
  .get(
    '/chip/:chipId/validate',
    async ({ params: { chipId } }) => {
      const result = await validateChipNumber(chipId);
      return result;
    },
    {
      params: t.Object({
        chipId: t.String({
          description: 'Microchip number to validate',
          minLength: 9,
          maxLength: 15,
        }),
      }),
      detail: {
        tags: ['Lookup'],
        summary: 'Validate microchip number',
        description:
          'Quick validation to check if a microchip number exists in the system and its current status',
        responses: {
          200: {
            description: 'Chip validation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: {
                      type: 'boolean',
                      description: 'Whether the chip number is valid',
                    },
                    status: {
                      type: 'string',
                      description: 'Current chip status',
                      enum: ['active', 'inactive', 'lost', 'found'],
                    },
                    registeredAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Registration timestamp',
                    },
                    message: {
                      type: 'string',
                      description: 'Human-readable status message',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  );