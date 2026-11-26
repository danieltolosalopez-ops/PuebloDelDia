// Municipios que pueden salir como "pueblo del día": capitales, ciudades y pueblos conocidos.
// Formato: 'Nombre[|otra forma] (código de provincia INE)'. Para adivinar se puede escribir cualquier municipio de España.
// Si un nombre no aparece en los datos oficiales, el generador lo avisa y lo salta.
export const PUEBLOS = `
Vitoria-Gasteiz|Vitoria 01; Llodio|Laudio 01; Laguardia|Guardia 01
Albacete 02; Hellín 02; Villarrobledo 02; Almansa 02; La Roda|Roda, La 02; Alcaraz 02
Alicante|Alacant 03; Elche|Elx 03; Torrevieja 03; Orihuela 03; Benidorm 03; Alcoy|Alcoi 03; Elda 03; San Vicente del Raspeig|Sant Vicent del Raspeig 03; Dénia 03; Villena 03; Jávea|Xàbia 03; Altea 03; Calpe|Calp 03; Guadalest|Castell de Guadalest, el 03; Santa Pola 03; Novelda 03; Petrer 03; Villajoyosa|Vila Joiosa, la 03
Almería 04; Roquetas de Mar 04; El Ejido|Ejido, El 04; Níjar 04; Vera 04; Mojácar 04; Adra 04; Huércal-Overa 04
Ávila 05; Arenas de San Pedro 05; Arévalo 05; Piedrahíta 05
Badajoz 06; Mérida 06; Don Benito 06; Almendralejo 06; Villanueva de la Serena 06; Zafra 06; Olivenza 06; Jerez de los Caballeros 06; Llerena 06
Palma 07; Calvià 07; Manacor 07; Ibiza|Eivissa 07; Ciutadella de Menorca 07; Mahón|Maó-Mahón|Maó 07; Inca 07; Sóller 07; Pollença 07; Alcúdia 07; Santa Eulària des Riu 07; Formentera 07; Valldemossa 07; Sant Antoni de Portmany 07
Barcelona 08; L'Hospitalet de Llobregat|Hospitalet de Llobregat, L' 08; Badalona 08; Terrassa 08; Sabadell 08; Mataró 08; Santa Coloma de Gramenet 08; Cornellà de Llobregat 08; Sant Cugat del Vallès 08; Manresa 08; Vic 08; Granollers 08; Vilanova i la Geltrú 08; Sitges 08; Igualada 08; Berga 08; Castelldefels 08; El Prat de Llobregat|Prat de Llobregat, El 08; Rubí 08; Viladecans 08; Sant Boi de Llobregat 08
Burgos 09; Miranda de Ebro 09; Aranda de Duero 09; Lerma 09; Covarrubias 09; Briviesca 09; Medina de Pomar 09
Cáceres 10; Plasencia 10; Navalmoral de la Mata 10; Trujillo 10; Coria 10; Guadalupe 10; Hervás 10; Jaraíz de la Vera 10
Cádiz 11; Jerez de la Frontera 11; Algeciras 11; San Fernando 11; El Puerto de Santa María|Puerto de Santa María, El 11; Chiclana de la Frontera 11; La Línea de la Concepción|Línea de la Concepción, La 11; Sanlúcar de Barrameda 11; Puerto Real 11; Arcos de la Frontera 11; Tarifa 11; Rota 11; Conil de la Frontera 11; Vejer de la Frontera 11; Grazalema 11; Barbate 11; Ubrique 11
Castellón de la Plana|Castelló de la Plana 12; Vila-real 12; Burriana 12; Benicarló 12; Vinaròs 12; Peñíscola|Peníscola 12; Onda 12; Morella 12; Benicàssim 12; Vall d'Uixó, la|La Vall d'Uixó 12
Ciudad Real 13; Puertollano 13; Tomelloso 13; Alcázar de San Juan 13; Valdepeñas 13; Manzanares 13; Almagro 13; Daimiel 13; Villanueva de los Infantes 13; Campo de Criptana 13
Córdoba 14; Lucena 14; Puente Genil 14; Montilla 14; Priego de Córdoba 14; Cabra 14; Palma del Río 14; Baena 14; Pozoblanco 14
A Coruña|Coruña, A|La Coruña 15; Santiago de Compostela 15; Ferrol 15; Narón 15; Oleiros 15; Arteixo 15; Carballo 15; Ribeira 15; Betanzos 15; Fisterra 15; Muros 15; Ortigueira 15
Cuenca 16; Tarancón 16; San Clemente 16; Motilla del Palancar 16; Belmonte 16; Las Pedroñeras|Pedroñeras, Las 16
Girona 17; Figueres 17; Blanes 17; Lloret de Mar 17; Olot 17; Salt 17; Palafrugell 17; Roses 17; Cadaqués 17; Puigcerdà 17; Ripoll 17; Banyoles 17; Besalú 17; Tossa de Mar 17
Granada 18; Motril 18; Almuñécar 18; Baza 18; Guadix 18; Loja 18; Armilla 18; Maracena 18; Lanjarón 18; Salobreña 18; Huéscar 18; Alhama de Granada 18
Guadalajara 19; Azuqueca de Henares 19; Sigüenza 19; Molina de Aragón 19; Pastrana 19; Brihuega 19
San Sebastián|Donostia/San Sebastián|Donostia 20; Irun 20; Errenteria 20; Eibar 20; Zarautz 20; Hondarribia 20; Tolosa 20; Getaria 20; Mondragón|Arrasate/Mondragón|Arrasate 20; Beasain 20; Azpeitia 20
Huelva 21; Lepe 21; Almonte 21; Moguer 21; Ayamonte 21; Isla Cristina 21; Aracena 21; Palos de la Frontera 21; Punta Umbría 21; Minas de Riotinto 21
Huesca 22; Monzón 22; Barbastro 22; Fraga 22; Jaca 22; Sabiñánigo 22; Benasque 22; Aínsa-Sobrarbe 22; Alquézar 22
Jaén 23; Linares 23; Andújar 23; Úbeda 23; Martos 23; Alcalá la Real 23; Baeza 23; Cazorla 23; La Carolina|Carolina, La 23; Bailén 23
León 24; Ponferrada 24; San Andrés del Rabanedo 24; Astorga 24; La Bañeza|Bañeza, La 24; Villafranca del Bierzo 24; Sahagún 24; Valencia de Don Juan 24
Lleida 25; Balaguer 25; Tàrrega 25; Mollerussa 25; La Seu d'Urgell|Seu d'Urgell, La 25; Vielha e Mijaran 25; Cervera 25; Solsona 25; Sort 25
Logroño 26; Calahorra 26; Arnedo 26; Haro 26; Alfaro 26; Santo Domingo de la Calzada 26; Nájera 26; Ezcaray 26
Lugo 27; Monforte de Lemos 27; Viveiro 27; Vilalba 27; Ribadeo 27; Sarria 27; Foz 27; Burela 27; Mondoñedo 27
Madrid 28; Móstoles 28; Alcalá de Henares 28; Fuenlabrada 28; Leganés 28; Getafe 28; Alcorcón 28; Torrejón de Ardoz 28; Parla 28; Alcobendas 28; Las Rozas de Madrid|Rozas de Madrid, Las 28; San Sebastián de los Reyes 28; Pozuelo de Alarcón 28; Rivas-Vaciamadrid 28; Coslada 28; Valdemoro 28; Majadahonda 28; Collado Villalba 28; Aranjuez 28; Arganda del Rey 28; Boadilla del Monte 28; Pinto 28; Colmenar Viejo 28; Tres Cantos 28; San Lorenzo de El Escorial 28; Chinchón 28; Buitrago del Lozoya 28; Navacerrada 28; Manzanares el Real 28; Rascafría 28
Málaga 29; Marbella 29; Mijas 29; Vélez-Málaga 29; Fuengirola 29; Torremolinos 29; Benalmádena 29; Estepona 29; Rincón de la Victoria 29; Antequera 29; Ronda 29; Alhaurín de la Torre 29; Nerja 29; Frigiliana 29; Coín 29; Archidona 29
Murcia 30; Cartagena 30; Lorca 30; Molina de Segura 30; Alcantarilla 30; Mazarrón 30; Cieza 30; Yecla 30; Águilas 30; San Javier 30; Totana 30; Jumilla 30; Caravaca de la Cruz 30; San Pedro del Pinatar 30; Los Alcázares|Alcázares, Los 30
Pamplona|Pamplona/Iruña|Iruña 31; Tudela 31; Barañáin|Barañain 31; Estella|Estella-Lizarra 31; Olite|Olite/Erriberri 31; Sangüesa|Sangüesa/Zangoza 31; Roncesvalles|Orreaga/Roncesvalles 31; Elizondo|Baztan 31; Tafalla 31; Corella 31
Ourense 32; Verín 32; O Barco de Valdeorras|Barco de Valdeorras, O 32; O Carballiño|Carballiño, O 32; Allariz 32; Ribadavia 32; Celanova 32
Oviedo 33; Gijón 33; Avilés 33; Siero 33; Langreo 33; Mieres 33; Castrillón 33; Llanes 33; Cangas de Onís 33; Ribadesella 33; Villaviciosa 33; Cudillero 33; Luarca|Valdés 33; Navia 33; Cangas del Narcea 33
Palencia 34; Aguilar de Campoo 34; Guardo 34; Venta de Baños 34; Frómista 34; Carrión de los Condes 34
Las Palmas de Gran Canaria|Palmas de Gran Canaria, Las 35; Telde 35; Santa Lucía de Tirajana 35; Arrecife 35; San Bartolomé de Tirajana 35; Arucas 35; Puerto del Rosario 35; Agüimes 35; Teguise 35; Gáldar 35; Mogán 35; Yaiza 35; Tías 35; La Oliva|Oliva, La 35; Pájara 35; Tejeda 35
Vigo 36; Pontevedra 36; Vilagarcía de Arousa 36; Redondela 36; Cangas 36; Marín 36; Ponteareas 36; Lalín 36; Sanxenxo 36; Tui 36; O Porriño|Porriño, O 36; Baiona 36; Cambados 36; A Guarda|Guarda, A 36; O Grove|Grove, O 36
Salamanca 37; Béjar 37; Ciudad Rodrigo 37; Santa Marta de Tormes 37; Alba de Tormes 37; La Alberca|Alberca, La 37; Ledesma 37
Santa Cruz de Tenerife 38; San Cristóbal de La Laguna|San Cristóbal de la Laguna 38; Arona 38; Adeje 38; La Orotava|Orotava, La 38; Granadilla de Abona 38; Los Realejos|Realejos, Los 38; Puerto de la Cruz 38; Santa Cruz de la Palma 38; Los Llanos de Aridane|Llanos de Aridane, Los 38; Icod de los Vinos 38; San Sebastián de la Gomera 38; Valverde 38; Candelaria 38; Garachico 38; Guía de Isora 38
Santander 39; Torrelavega 39; Castro-Urdiales 39; Camargo 39; Piélagos 39; Laredo 39; Santillana del Mar 39; Comillas 39; San Vicente de la Barquera 39; Santoña 39; Reinosa 39; Potes 39; Noja 39; Suances 39
Segovia 40; Cuéllar 40; San Ildefonso 40; El Espinar|Espinar, El 40; Sepúlveda 40; Pedraza 40; Riaza 40
Sevilla 41; Dos Hermanas 41; Alcalá de Guadaíra 41; Utrera 41; Mairena del Aljarafe 41; Écija 41; La Rinconada|Rinconada, La 41; Los Palacios y Villafranca|Palacios y Villafranca, Los 41; Carmona 41; Osuna 41; Estepa 41; Lebrija 41; Marchena 41; Morón de la Frontera 41; Coria del Río 41; Tomares 41
Soria 42; Almazán 42; El Burgo de Osma-Ciudad de Osma|Burgo de Osma-Ciudad de Osma, El 42; Medinaceli 42; Ágreda 42; San Leonardo de Yagüe 42
Tarragona 43; Reus 43; Tortosa 43; El Vendrell|Vendrell, El 43; Cambrils 43; Salou 43; Valls 43; Amposta 43; Calafell 43; Deltebre 43; Montblanc 43; Falset 43; Sant Carles de la Ràpita|La Ràpita|Ràpita, La 43
Teruel 44; Alcañiz 44; Andorra 44; Calamocha 44; Albarracín 44; Valderrobres 44; Mora de Rubielos 44; Utrillas 44
Toledo 45; Talavera de la Reina 45; Illescas 45; Seseña 45; Torrijos 45; Consuegra 45; Ocaña 45; Quintanar de la Orden 45; Madridejos 45; Oropesa 45; Tembleque 45; Escalona 45
Valencia|València 46; Torrent 46; Gandia 46; Paterna 46; Sagunto|Sagunt 46; Alzira 46; Mislata 46; Burjassot 46; Ontinyent 46; Xàtiva 46; Requena 46; Cullera 46; Sueca 46; Oliva 46; Utiel 46; Buñol 46; Llíria 46; Manises 46; Catarroja 46; Bocairent 46
Valladolid 47; Medina del Campo 47; Laguna de Duero 47; Arroyo de la Encomienda 47; Tordesillas 47; Peñafiel 47; Tudela de Duero 47; Medina de Rioseco 47; Simancas 47
Bilbao 48; Barakaldo 48; Getxo 48; Portugalete 48; Santurtzi 48; Basauri 48; Leioa 48; Durango 48; Galdakao 48; Sestao 48; Gernika-Lumo 48; Bermeo 48; Lekeitio 48; Mundaka 48; Balmaseda 48
Zamora 49; Benavente 49; Toro 49; Puebla de Sanabria 49; Fermoselle 49
Zaragoza 50; Calatayud 50; Utebo 50; Ejea de los Caballeros 50; Tarazona 50; Caspe 50; La Almunia de Doña Godina|Almunia de Doña Godina, La 50; Borja 50; Daroca 50; Sos del Rey Católico 50; Cariñena 50; Fuendetodos 50
Ceuta 51
Melilla 52
`.split(/[;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => {
  const m = s.match(/^(.*)\s+(\d{2})$/);
  if (!m) throw new Error(`Formato incorrecto en la lista de pueblos: «${s}»`);
  return { nombres: m[1].split('|').map((x) => x.trim()), prov: m[2] };
});
