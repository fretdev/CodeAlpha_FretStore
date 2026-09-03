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
    pgm.createTable("products",{
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        category_id: {
            type: "bigint",
            notNull: true,
            references: "categories(id)",
            onDelete: "RESTRICT",
        },
        name: {
            type: "varchar(255)",
            notNull: true,
        },
        brand: {
            type: "varchar(100)",
            notNull: true,
        },
        description: {
            type: "text",
        },
        price: {
            type: "numeric(10,2)",
            notNull: true,
        },
        stock_quantity: {
            type: "integer",
            notNull: true,
            default: 0,
        },
        image_url: {
            type: "text",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("products");
};
