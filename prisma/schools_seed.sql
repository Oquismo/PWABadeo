-- Script para poblar escuelas predefinidas
-- Ejecutar después de crear la tabla de escuelas

INSERT INTO "School" (name, address, city, province, country, type, level, description, "isActive", "createdAt", "updatedAt") VALUES
-- Escuelas de Madrid
('CEIP San Patricio', 'Calle de San Patricio, 23', 'Madrid', 'Madrid', 'España', 'pública', 'primaria', 'Centro de educación infantil y primaria ubicado en el centro de Madrid', true, NOW(), NOW()),
('Colegio Sagrado Corazón', 'Avenida de América, 45', 'Madrid', 'Madrid', 'España', 'concertada', 'primaria', 'Colegio concertado con tradición educativa', true, NOW(), NOW()),
('CEIP Ramón y Cajal', 'Calle de Alcalá, 123', 'Madrid', 'Madrid', 'España', 'pública', 'primaria', 'Centro público de educación primaria', true, NOW(), NOW()),
('Colegio Internacional SEK', 'Urbanización Ciudalcampo', 'San Sebastián de los Reyes', 'Madrid', 'España', 'privada', 'secundaria', 'Colegio internacional bilingüe', true, NOW(), NOW()),

-- Escuelas de Barcelona
('CEIP Antoni Gaudí', 'Carrer de Gaudí, 15', 'Barcelona', 'Cataluña', 'España', 'pública', 'primaria', 'Escuela pública en el Eixample de Barcelona', true, NOW(), NOW()),
('Col·legi Sagrat Cor', 'Passeig de Gràcia, 78', 'Barcelona', 'Cataluña', 'España', 'concertada', 'primaria', 'Col·legi concertat amb ensenyament bilingüe', true, NOW(), NOW()),
('CEIP Mare de Déu del Carme', 'Carrer del Carme, 34', 'Barcelona', 'Cataluña', 'España', 'pública', 'primaria', 'Centre d''educació infantil i primària al Raval', true, NOW(), NOW()),

-- Escuelas de Valencia
('CEIP Cervantes', 'Calle Cervantes, 12', 'Valencia', 'Valencia', 'España', 'pública', 'primaria', 'Centro de educación primaria en el centro histórico', true, NOW(), NOW()),
('Colegio San José de Calasanz', 'Avenida del Puerto, 67', 'Valencia', 'Valencia', 'España', 'concertada', 'secundaria', 'Colegio concertado con formación integral', true, NOW(), NOW()),
('CEIP La Mediterrània', 'Calle de la Playa, 89', 'Valencia', 'Valencia', 'España', 'pública', 'primaria', 'Escuela cerca de la playa de la Malvarrosa', true, NOW(), NOW()),

-- Escuelas de Sevilla
('CEIP Bécquer', 'Calle Gustavo Adolfo Bécquer, 56', 'Sevilla', 'Andalucía', 'España', 'pública', 'primaria', 'Centro público en el barrio de Triana', true, NOW(), NOW()),
('Colegio San Francisco de Paula', 'Calle San Jorge, 23', 'Sevilla', 'Andalucía', 'España', 'privada', 'secundaria', 'Colegio privado con amplia tradición', true, NOW(), NOW()),

-- Escuelas de Bilbao
('CEIP Miribilla', 'Calle Miribilla, 34', 'Bilbao', 'País Vasco', 'España', 'pública', 'primaria', 'Ikastola públika euskeraz', true, NOW(), NOW()),
('Colegio Askartza', 'Avenida Askartza, 12', 'Bilbao', 'País Vasco', 'España', 'concertada', 'primaria', 'Colegio concertado bilingüe euskera-castellano', true, NOW(), NOW()),

-- Escuelas rurales
('CRA Los Robles', 'Plaza del Pueblo, 1', 'Navalcarnero', 'Madrid', 'España', 'pública', 'primaria', 'Colegio rural agrupado', true, NOW(), NOW()),
('CEIP Sierra Nevada', 'Calle Principal, 45', 'Monachil', 'Granada', 'España', 'pública', 'primaria', 'Escuela en zona de montaña', true, NOW(), NOW()),

-- Centros especializados
('Centro de Educación Especial ASPACE', 'Calle de la Inclusión, 78', 'Madrid', 'Madrid', 'España', 'pública', 'primaria', 'Centro especializado en necesidades educativas especiales', true, NOW(), NOW()),
('Escuela de Arte y Diseño', 'Calle del Arte, 23', 'Barcelona', 'Cataluña', 'España', 'pública', 'secundaria', 'Centro especializado en artes y diseño', true, NOW(), NOW());
