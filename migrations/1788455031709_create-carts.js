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
    pgm.createTable("carts",{
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        user_id: {
            type: "bigint",
            notNull: true,
            unique: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.createTable("cart_items",{
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        cart_id: {
            type: "bigint",
            notNull: true,
            references: "carts(id)",
            onDelete: "CASCADE",
        },
        product_id: {
            type: "bigint",
            notNull: true,
            references: "products(id)",
            onDelete: "RESTRICT",
        },
        quantity: {
            type: "integer",
            notNull: true,
            default: 1,
        },
    });

    pgm.addConstraint("cart_items","unique_cart_product",{
        unique: ["cart_id","product_id"]
    });
    pgm.addConstraint("cart_items","quantity_positive",{
        check: "quantity > 0"
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("cart_items");
    pgm.dropTable("carts");
};
