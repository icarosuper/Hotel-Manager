// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const hotelsTable = createTable("hotels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  deleted: boolean("deleted").notNull().default(false),
});

export const usersTable = createTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  role: varchar("role", { length: 50 }).array().notNull().default([]),
});

export const roomsTable = createTable("rooms", {
  number: integer("number").primaryKey(),
  hotelId: serial("hotel_id")
    .notNull()
    .references(() => hotelsTable.id, { onDelete: "cascade" }),
  floor: integer("floor").notNull(),
  available: boolean("available").notNull().default(true),
  beds: integer("beds").notNull(),
  description: varchar("description", { length: 100 }).notNull().default(""),
  dailyRate: doublePrecision("daily_rate").notNull(),
});

export const employeesTable = createTable("employees", {
  cpf: varchar("cpf", { length: 15 }).primaryKey(),
  userId: serial("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  hotelId: serial("hotel_id")
    .notNull()
    .references(() => hotelsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 100 }),
});

export const tasksTable = createTable("tasks", {
  id: serial("id").primaryKey(),
  employeeId: serial("employee_id").references(() => employeesTable.userId, {
    onDelete: "set null",
  }),
  description: varchar("description", { length: 100 }).notNull(),
  start: timestamp("start"),
  end: timestamp("end"),
});

export const customersTable = createTable("customers", {
  cpf: varchar("cpf", { length: 15 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  address: varchar("address", { length: 100 }),
});

export const reservationsTable = createTable("reservations", {
  number: serial("number").primaryKey(),
  roomNumber: integer("room_number").references(() => roomsTable.number, {
    onDelete: "set null",
  }),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  totalPrice: doublePrecision("total_price").notNull().default(0),
  statusPaid: boolean("status_paid").notNull().default(false),
  vehicles: varchar("vehicles", { length: 50 }).array().notNull().default([]),
});

export const customerReservationsTable = createTable(
  "customer_reservations",
  {
    customerCpf: varchar("customer_cpf", { length: 15 })
      .notNull()
      .references(() => customersTable.cpf, { onDelete: "cascade" }),
    reservationNumber: serial("reservation_number")
      .notNull()
      .references(() => reservationsTable.number, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.customerCpf, table.reservationNumber] }),
  }),
);

export const roomServicesTable = createTable("room_services", {
  taskId: serial("taskId")
    .primaryKey()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  reservationNumber: serial("reservation_number")
    .notNull()
    .references(() => reservationsTable.number, { onDelete: "cascade" }),
  price: doublePrecision("price").notNull(),
});

export const expensesTable = createTable("expenses", {
  id: serial("id").primaryKey(),
  hotelId: serial("hotel_id")
    .notNull()
    .references(() => hotelsTable.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 100 }).notNull(),
  value: doublePrecision("value").notNull(),
  date: timestamp("date")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
