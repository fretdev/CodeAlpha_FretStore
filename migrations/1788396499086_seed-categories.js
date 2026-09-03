/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql( `
        INSERT INTO categories (name) VALUES
        ('Electric Guitars'),
        ('Acoustic Guitars'),
        ('Bass Guitars'),
        ('Accessories'),
        ('Amplifiers');
        `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DELETE FROM categories
        WHERE name IN (
        'Electric Guitars',
        'Acoustic Guitars',
        'Bass Guitars',
        'Accessories',
        'Amplifiers'
        );
        `);
};
