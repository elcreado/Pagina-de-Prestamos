create table usuarios (
    id serial primary key,
    nombre_completo varchar(255) not null,
    username varchar(50) not null unique,
    password_hash varchar(255) not null,
    role varchar(20) not null,
    is_active boolean default true,
    created_by integer references usuarios (id),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table prestamos (
    id serial primary key,
    usuario_id integer references usuarios (id),
    moneda varchar(10) not null,
    monto_desembolsado decimal(10, 2) not null,
    tasa_interes_mensual decimal(5, 2) not null,
    fecha_inicio date not null,
    fecha_vencimiento date,
    estado varchar(20) not null,
    nota text,
    created_at timestamp default current_timestamp
);

create table movimientos_prestamos (
    id serial primary key,
    prestamo_id integer references prestamos (id),
    tipo varchar(20) not null,
    monto decimal(10, 2) not null,
    fecha date not null,
    nota text,
    referencia varchar(255)
);

create table saldos_prestamos (
    prestamo_id integer references prestamos (id),
    usuario_id integer references usuarios (id),
    moneda varchar(10) not null,
    saldo decimal(10, 2) not null,
    primary key (prestamo_id, usuario_id)
);

## Create admin user
INSERT INTO usuarios (nombre_completo, username, password_hash, role, is_active) VALUES ('Admin', 'admin', 'admin', 'admin', true);