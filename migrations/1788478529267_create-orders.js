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
    pgm.createTable("orders",{
        id: {
            type: "bigserial",
            primaryKey: true
        },
        user_id: {
            type: "bigint",
            notNull: true,
            references: "users(id)",
            onDelete: "RESTRICT",
        },
        status: {
            type: "varchar(30)",
            notNull: true,
            default: "pending",
        },
        total_amount: {
            type: "numeric(12,2)",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.createTable("order_items",{
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        order_id: {
            type: "bigint",
            notNull: true,
            references: "orders(id)",
            onDelete: "CASCADE",
        },
        product_id: {
            type: "bigint",
            notNull: true,
            references: "products(id)",
            onDelete: "RESTRICT",
        },
        product_name: {
            type: "varchar(255)",
            notNull: true,
        },
        unit_price: {
            type: "numeric(12,2)",
            notNull: true,
        },
        quantity: {
            type: "integer",
            notNull: true,
        },
    });

    pgm.addConstraint("orders","total_amount_non_negative",{
        check: "total_amount >= 0",
    });

    pgm.addConstraint("order_items","unit_price_not_negative",{
        check: "unit_price >= 0",
    });
    pgm.addConstraint("order_items","quantity_positive",{
        check: "quantity > 0",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("order_items");
    pgm.dropTable("orders");
};
