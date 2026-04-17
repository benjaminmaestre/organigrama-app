export interface Member {
  name: string;
  role: string;
  congregation?: string;
  email?: string;
  phone?: string;
  auxiliaries?: Member[];
  subDepartments?: Department[];
  groups?: { name: string; members: Member[] }[];
}

export interface Department {
  name: string;
  head: Member;
}

export const orgData: Member = {
  name: "Juan Carlos Rossero",
  role: "Presidente de la Asamblea",
  congregation: "SC", email: "5996428@jwpub.org", phone: "+573174407009",
  auxiliaries: [
    { name: "Mauricio Ortíz", role: "Auxiliar del Presidente", congregation: "CENTRAL ANDINA", email: "MOrtiz42@jwpub.org", phone: "+573104950905" },
    { name: "Carlos Mario Alzate", role: "Auxiliar del Presidente", congregation: "BOLÍVAR", email: "AlzateRodrC@jwpub.org", phone: "+573187162558" },
  ],
  subDepartments: [
    {
      name: "Coordinación del Comité",
      head: {
        name: "Sergio Amador",
        role: "Coordinador del Comité de Asamblea",
        congregation: "SAN JAVIER",
        email: "1SergioAA@jwpub.org",
        phone: "+573007830254",
        auxiliaries: [
          { name: "Juan Fernando Ramírez", role: "Auxiliar del Coordinador", congregation: "LAURELES", email: "JRamirezGir18@jwpub.org", phone: "+573008172021" }
        ],
        subDepartments: [
          { name: "Acomodadores", head: { name: "Alberto Sánchez", role: "Superintendente", congregation: "Napoles-Salgar", phone: "+573165268674", email: "lsanchez@jwpub.org", auxiliaries: [
            { name: "Juan Alejandro Flórez", role: "Auxiliar", congregation: "Laureles", phone: "+573136857191", email: "FlorezpatiJuan1@jwpub.org" },
            { name: "Hernando Dávila", role: "Auxiliar", congregation: "Villanueva-Betulia", phone: "+573127167890", email: "HernandoDavila@jwpub.org" },
            { name: "Omar Ramírez", role: "Auxiliar", congregation: "La Divisa", phone: "+573246744348", email: "Omarr2@jwpub.org" }
          ]}},
          { name: "Coordinador de Seguridad", head: { name: "Juan Diego Mejía", role: "Superintendente", congregation: "Farallones-Betania", phone: "+573003723319", email: "JuanM10@jwpub.org", auxiliaries: [
            { name: "Widmar Grisales", role: "Auxiliar", congregation: "Las Violetas", phone: "+573148059978", email: "WidmarG3@jwpub.org" }
          ]}},
          { name: "Contabilidad", head: { name: "Gildardo Toro", role: "Superintendente", congregation: "San Javier", phone: "+573104136783", email: "GToroLopez@jwpub.org", auxiliaries: [
            { name: "Javier Villa", role: "Auxiliar", congregation: "Guayacanes-Jardín", phone: "+573014501710", email: "JVilla3@jwpub.org" },
            { name: "Alexander Castrillón", role: "Auxiliar", congregation: "La Divisa", phone: "+573126866457", email: "JohnC40@jwpub.org" },
            { name: "Alexander Uribe", role: "Auxiliar", congregation: "Girasoles-Caicedo", phone: "+573006176931", email: "UribeA@jwpub.org" }
          ]}},
          { name: "Estacionamiento", head: { name: "Fernando Cardona", role: "Superintendente", congregation: "San Javier", phone: "+573053789889", email: "CardonaL@jwpub.org", auxiliaries: [
            { name: "Luis Miguel Martínez", role: "Auxiliar", congregation: "Andes-Central Andina", phone: "+573182759445", email: "34LuisM@jwpub.org" }
          ]}},
          { name: "Primeros Auxilios", head: { name: "Santiago Guapachá", role: "Superintendente", congregation: "La Aldea-Jericó", phone: "+573116331401", email: "55GSantiago@jwpub.org", auxiliaries: [
            { name: "Alberto Centeno", role: "Auxiliar", congregation: "La Divisa", phone: "+573105028815", email: "9CAlberto@jwpub.org" },
            { name: "Jaime Gil", role: "Auxiliar", congregation: "La Divisa", phone: "+573004081464", email: "LeonJaimeG@jwpub.org" },
          ]}},
          { name: "Seguridad", head: { name: "Luis Ardila", role: "Superintendente", congregation: "San Javier", phone: "+573196197782", email: "ArdilaL@jwpub.org", auxiliaries: [
            { name: "Andrés Piedrahita", role: "Auxiliar", congregation: "Agualinda-Hispania", phone: "+573122486566", email: "11JorgeP@jwpub.org" },
            { name: "Mauricio Serna", role: "Auxiliar", congregation: "La Divisa", phone: "+573006454489", email: "MAURICIOS7@jwpub.org" },
          ]}}
        ]
      }
    },
    {
      name: "Programa",
      head: {
        name: "Brayan Rincón",
        role: "Superintendente del Programa",
        congregation: "CONCORDIA",
        email: "1BRAYANRINCON@jwpub.org",
        phone: "+573213362241",
        auxiliaries: [
          { name: "Jeikson Ramírez", role: "Auxiliar Sup. Programa", congregation: "LA PRADERA", email: "JeiksonSR2@jwpub.org", phone: "+573117003405" }
        ],
        subDepartments: [
          { 
            name: "Audio y Video", 
            head: {
              name: "James Villamizar", 
              role: "Superintendente", 
              congregation: "Laureles", 
              email: "10JVillamizar@jwpub.org",
              phone: "+573006080689", 
              groups: [
                {
                  name: "Audio",
                  members: [
                    { name: "Diego Amador", role: "Superintendente", congregation: "San Javier", phone: "+573194400214", email: "DiegoAmadorMata@jwpub.org" },
                    { name: "Cristian Ochoa", role: "Auxiliar", congregation: "Guayacanes-Jardín", phone: "+573015265710", email: "30Cristiano@jwpub.org" },
                    { name: "Roddy Vargas", role: "Auxiliar", congregation: "San Javier", phone: "+573006809460", email: "RoddyV@jwpub.org" },
                    { name: "Sebastian Uribe", role: "Auxiliar", congregation: "Girasoles-Caicedo", phone: "+573508575555", email: "USebastian19@jwpub.org" },
                  ]
                },
                {
                  name: "Video",
                  members: [
                    { name: "Mateo Ramírez", role: "Superintendente", congregation: "Laureles", phone: "+573168272226", email: "4MRAMIREZ@jwpub.org" },
                    { name: "Jorge Blandón", role: "Auxiliar", congregation: "Páramo-Urrao", phone: "+573122844627", email: "BJORGE28@jwpub.org" },
                    { name: "Gonzalo Álvarez", role: "Auxiliar", congregation: "Las Violetas", phone: "+573205398031", email: "2GonzaloAlvarez@jwpub.org" },
                    { name: "Jorge Ochoa", role: "Auxiliar", congregation: "Laureles", phone: "+573148059988", email: "2OJorge@jwpub.org" },
                  ]
                },
                {
                  name: "Plataforma",
                  members: [
                    { name: "Richard Bolaños", role: "Superintendente", congregation: "La Divisa", phone: "+573003250221", email: "56RichardB@jwpub.org" },
                    { name: "Christian Martínez", role: "Auxiliar", congregation: "Guayacanes-Jardín", phone: "+573102766574", email: "ChristianMartinez2@jwpub.org" },
                    { name: "Jorge Taborda", role: "Auxiliar", congregation: "La Pradera-Carmen de Atrato", phone: "+573103623977", email: "Jtaborda5@jwpub.org" },
                  ]
                },
                {
                  name: "JW Stream",
                  members: [
                    { name: "Camilo Mateus", role: "Superintendente", congregation: "Betania-Antioquia", phone: "+573045212640", email: "1MateusCamilo@jwpub.org" },
                    { name: "Juan Andrés Rojas", role: "Auxiliar", congregation: "La Divisa", phone: "+573168382090", email: "Rojascuellj9@jwpub.org" },
                  ]
                }
              ]
            }
          },
          { name: "Bautismo", head: { name: "Álvaro Ramírez", role: "Superintendente", congregation: "Entre Colinas-Amagá", phone: "+573137080035", email: "7RamirezA@jwpub.org", auxiliaries: [
            { name: "Humberto Gutierrez", role: "Auxiliar", congregation: "San Javier", phone: "+573104105081", email: "GCristo26@jwpub.org" }
          ]}}
        ]
      }
    },
    {
      name: "Alojamiento y Servicios",
      head: {
        name: "Jhonny Florez",
        role: "Superintendente de Alojamiento",
        congregation: "SAN JAVIER",
        email: "JhonnyFlorezEstr@jwpub.org",
        phone: "+573006146808",
        auxiliaries: [
          { name: "Benjamín Pérez", role: "Auxiliar Sup. Alojamiento", congregation: "Las Violetas", email: "BenjaminP21@jwpub.org", phone: "+573107379163" }
        ],
        subDepartments: [
          { name: "Alojamiento", head: { name: "Félix Pérez", role: "Superintendente", congregation: "Las Violetas", phone: "+573107407493", email: "FelixPerez32@jwpub.org", auxiliaries: [
            { name: "Javier Osorio", role: "Auxiliar", congregation: "Entre Colinas-Amagá", phone: "+573164418886", email: "josorio@jwpub.org" },
            { name: "Luis Castrillo", role: "Auxiliar", congregation: "Las Violetas", phone: "+573507041608", email: "LuisCastrilloG20@jwpub.org" }
          ]}},
          { name: "Limpieza", head: { name: "Andrés López", role: "Superintendente", congregation: "Laureles", phone: "+573226264301", email: "AndresLopez@jwpub.org", auxiliaries: [
            { name: "Jhon Jairo Quiróz", role: "Auxiliar", congregation: "Entre Colinas-Amagá", phone: "+573132560170", email: "QJhon18@jwpub.org" },
            { name: "Cristóbal Mejías", role: "Auxiliar", congregation: "San Javier", phone: "+573194649436", email: "MCristobal35@jwpub.org" },
            { name: "Santiago Giraldo", role: "Auxiliar", congregation: "San Javier", phone: "+573137216901", email: "SGiraldoAco7@jwpub.org" }
          ]}},
          { name: "Instalación", head: { name: "Alfredo Ramírez", role: "Superintendente", congregation: "San Javier", phone: "+573148187746", email: "RamirezAlfredo@jwpub.org", auxiliaries: [
            { name: "Jhon Deibis Montoya", role: "Auxiliar", congregation: "Penderisco-Urrao", phone: "+573502091697", email: "MJhon31@jwpub.org" },
            { name: "Jhonatan Zabala", role: "Auxiliar", congregation: "Bolivar-Ciudad Bolívar", phone: "+573176236235", email: "JonatanZ1@jwpub.org" },
            { name: "Victor Balza", role: "Auxiliar", congregation: "Los Girasoles-Caicedo", phone: "+573247140377", email: "19BVictor@jwpub.org" }
          ]}},
          { name: "Información y Servicio Voluntario", head: { name: "Ronald Velásquez", role: "Superintendente", congregation: "La Aldea-Jericó", phone: "+573054691917", email: "RonaldV8@jwpub.org", auxiliaries: [
            { name: "Jeison Morales", role: "Auxiliar", congregation: "Páramo-Urrao", phone: "+573052484323", email: "JeysonM14@jwpub.org" }
          ]}},
          { name: "Objetos Perdidos y Guardarropa", head: { name: "David Campos", role: "Superintendente", congregation: "La Divisa", phone: "+573043290556", email: "DavidCampos12@jwpub.org", auxiliaries: [
            { name: "Bayron Cañas", role: "Auxiliar", congregation: "Agualinda-Hispania", phone: "+573173642605", email: "ECanas1@jwpub.org" },
            { name: "Gustavo Rodríguez", role: "Auxiliar", congregation: "La Divisa", phone: "+573006338877", email: "RGustavo17@jwpub.org" }
          ]}},
          { name: "Transporte y Materiales", head: { name: "Luis Ospina", role: "Superintendente", congregation: "Las Violetas", phone: "+573146809366", email: "OspinaRodrLuis3@jwpub.org", auxiliaries: [
            { name: "Nelson Gallego", role: "Auxiliar", congregation: "Urrao", phone: "+573137075790" }
          ]}}
        ]
      }
    }
  ]
};
