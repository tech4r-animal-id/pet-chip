import { Elysia, t } from 'elysia';
import { assignChipToAnimal, getChipByNumber, deactivateChip } from '../controllers/chipController';
import { authenticate } from '../middleware/auth';


export const chipRoutes = new Elysia({ prefix: '/api/v1/chips' })
    
    
    

    
    .post(
        '/assign',
        async (context) => {
            await authenticate(context);
            const { body } = context;
            const result = await assignChipToAnimal(body);
            return result;
        },
        {
            body: t.Object({
                chipNumber: t.String({
                    minLength: 15,
                    maxLength: 15,
                    description: 'Microchip number (ISO 11784/11785 format)',
                }),
                animalId: t.String({
                    format: 'uuid',
                    description: 'UUID of the animal to assign chip to',
                }),
                implantationDate: t.Optional(
                    t.String({
                        format: 'date',
                        description: 'Date when chip was implanted (YYYY-MM-DD)',
                    })
                ),
                implanterId: t.Optional(
                    t.String({
                        format: 'uuid',
                        description: 'UUID of the veterinarian who implanted the chip',
                    })
                ),
                holdingId: t.Optional(
                    t.Number({
                        description: 'ID of the holding where chip was implanted',
                    })
                ),
            }),
            detail: {
                summary: 'Assign chip to animal',
                tags: ['Chips'],
                description:
                    'Assign a microchip to an animal. Creates new chip record or reactivates existing inactive chip.',
            },
        }
    )

    
    .get(
        '/:chipNumber',
        async (context) => {
            await authenticate(context);
            const { params } = context;
            const chip = await getChipByNumber(params.chipNumber);
            return chip;
        },
        {
            params: t.Object({
                chipNumber: t.String({
                    description: 'Microchip number to lookup',
                    minLength: 15,
                    maxLength: 15,
                }),
            }),
            detail: {
                summary: 'Get chip details',
                tags: ['Chips'],
                description: 'Retrieve chip information including associated animal and holding details.',
            },
        }
    )

    
    .post(
        '/:chipNumber/deactivate',
        async (context) => {
            await authenticate(context);
            const { params, body } = context;
            const result = await deactivateChip(params.chipNumber, body?.reason);
            return result;
        },
        {
            params: t.Object({
                chipNumber: t.String({
                    description: 'Microchip number to deactivate',
                    minLength: 15,
                    maxLength: 15,
                }),
            }),
            body: t.Optional(
                t.Object({
                    reason: t.Optional(
                        t.String({
                            description: 'Reason for deactivation',
                        })
                    ),
                })
            ),
            detail: {
                summary: 'Deactivate chip',
                tags: ['Chips'],
                description: 'Deactivate a microchip (e.g., when removed, lost, or malfunctioning).',
            },
        }
    );
