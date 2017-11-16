define({ "api": [  {    "type": "post",    "url": "/api/pillbottle/doc",    "title": "Authorize Doctor",    "name": "Doctor_Authorization",    "description": "<p>Used by patient to Authorize doctor to access pill bottle.</p>",    "group": "Authentication",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "pillBottleId",            "description": "<p>Unique ID of the pill bottle to be authorized</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "doctorUsername",            "description": "<p>Username of the doctor to authorize</p>"          }        ]      },      "examples": [        {          "title": "Request-Example: ",          "content": "{\n  pillBottleId: 5,\n  doctorUsername: \"balathedoctor\"\n}",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>ok</p>"          }        ]      }    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token / Bad Doctor Username</p>"          }        ],        "Error 400": [          {            "group": "Error 400",            "optional": false,            "field": "ClientError",            "description": "<p>Redundant Registration</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodeAuthenticationAPI/authService.js",    "groupTitle": "Authentication"  },  {    "type": "post",    "url": "/api/login",    "title": "User Login",    "name": "Login",    "description": "<p>Login (doctor/patient) to cloud</p>",    "group": "Authentication",    "parameter": {      "examples": [        {          "title": "Request-Example: ",          "content": "{   \n  username: \"omsaran\"\n  password: \"password123\" \n}",          "type": "json"        }      ],      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "username",            "description": "<p>Username of the user</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "password",            "description": "<p>Password to login</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "token",            "description": "<p>Access Token for logged in user</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "{\n  token: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg\"\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Credentials</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodeAuthenticationAPI/authService.js",    "groupTitle": "Authentication"  },  {    "type": "post",    "url": "/api/device",    "title": "Mobile Device Registration",    "name": "Mobile_Registration",    "description": "<p>Register Mobile Device to cloud</p>",    "group": "Authentication",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "parameter": {      "examples": [        {          "title": "Request-Example: ",          "content": "{   \n  platform: 1\n  deviceId: \"qWezFGMMF\" \n}",          "type": "json"        }      ],      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "platform",            "description": "<p>1 - Android, 2 - iOS</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "deviceId",            "description": "<p>Unique Device ID for FCM</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>ok</p>"          }        ]      }    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token</p>"          }        ],        "Error 400": [          {            "group": "Error 400",            "optional": false,            "field": "ClientError",            "description": "<p>Device already registered</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodeAuthenticationAPI/authService.js",    "groupTitle": "Authentication"  },  {    "type": "post",    "url": "/api/pillbottle",    "title": "Pillbottle Registration",    "name": "Pillbottle_Registration",    "description": "<p>Register Pillbottle to the cloud to obtain unique ID</p>",    "group": "Authentication",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>Unique ID for the pill bottle</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "{\n  id: 1\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodeAuthenticationAPI/authService.js",    "groupTitle": "Authentication"  },  {    "type": "post",    "url": "/api/signup",    "title": "User Registration",    "name": "Signup",    "description": "<p>Register the user (doctor/patient) to cloud</p>",    "group": "Authentication",    "parameter": {      "examples": [        {          "title": "Request-Example: ",          "content": "{\n  name: \"Om\",\n  username: \"omsaran\"\n  password: \"password123\"\n  typeId: 1\n}",          "type": "json"        }      ],      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "name",            "description": "<p>Name of the user</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "username",            "description": "<p>Username of the user</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "password",            "description": "<p>Password to login</p>"          },          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "typeId",            "description": "<p>1 - Patient, 2 - Doctor</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>ID of the registered user</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "{\n  id: 1\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 400": [          {            "group": "Error 400",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>Bad Request</p>"          }        ],        "Error 409": [          {            "group": "Error 409",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>Username Unavailable</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodeAuthenticationAPI/authService.js",    "groupTitle": "Authentication"  },  {    "type": "delete",    "url": "/api/dosage/pillbottle/:id",    "title": "Delete dosage",    "name": "Delete_dosage",    "description": "<p>To remove existing dosage in pillbottle</p>",    "group": "Pillbottle",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>ok</p>"          }        ]      }    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token / Bad Doctor Username</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodePillAPI/pillService.js",    "groupTitle": "Pillbottle"  },  {    "type": "post",    "url": "/api/dosage/pillbottle/:id",    "title": "Add new dosage",    "name": "New_dosage",    "description": "<p>To get pillbottle json of given id</p>",    "group": "Pillbottle",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>id of the pill bottle</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "pill",            "description": "<p>pill name</p>"          },          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "course",            "description": "<p>Course ID</p>"          },          {            "group": "Success 200",            "type": "JSON",            "optional": false,            "field": "dosage",            "description": "<p>Dosage details</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "time",            "description": "<p>Dosage timestamp</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "{\n   \"id\": 2,\n   \"pill\": \"Montek\"\n   \"course\": 4,\n   \"description\": \"Cold, Cough\",\n   \"dosage\": [\n       {\n           \"time\": \"06:00:00\"\n       },\n       {\n           \"time\": \"15:00:00\"\n       }\n   ]\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token / Bad Doctor Username</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodePillAPI/pillService.js",    "groupTitle": "Pillbottle"  },  {    "type": "get",    "url": "/api/pillbottle",    "title": "Pillbottle Details",    "name": "Pillbottle",    "description": "<p>To get pillbottle json array associated with user</p>",    "group": "Pillbottle",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>id of the pill bottle</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "pill",            "description": "<p>pill name</p>"          },          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "course",            "description": "<p>Course ID</p>"          },          {            "group": "Success 200",            "type": "JSON",            "optional": false,            "field": "dosage",            "description": "<p>Dosage details</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "time",            "description": "<p>Dosage timestamp</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "[\n  {\n     \"id\": 2,\n     \"pill\": \"Montek\"\n     \"course\": 4,\n     \"description\": \"Cold, Cough\",\n     \"dosage\": [\n         {\n             \"time\": \"06:00:00\"\n         },\n         {\n             \"time\": \"15:00:00\"\n         }\n     ]\n  }\n]",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token / Bad Doctor Username</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodePillAPI/pillService.js",    "groupTitle": "Pillbottle"  },  {    "type": "get",    "url": "/api/pillbottle/:id",    "title": "Pillbottle Details",    "name": "Pillbottle",    "description": "<p>To get pillbottle json of given id</p>",    "group": "Pillbottle",    "header": {      "fields": {        "Header": [          {            "group": "Header",            "optional": false,            "field": "Authorization",            "description": "<p>Bearer Access Token</p>"          }        ]      },      "examples": [        {          "title": "Request-Header: ",          "content": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0Ij0xNTA4Njc1OTc1fQ.96NXj1C8wxkfy5f_vjDrDH1Pl4GzUB299ikwlWYinNg",          "type": "json"        }      ]    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "id",            "description": "<p>id of the pill bottle</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "pill",            "description": "<p>pill name</p>"          },          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "course",            "description": "<p>Course ID</p>"          },          {            "group": "Success 200",            "type": "JSON",            "optional": false,            "field": "dosage",            "description": "<p>Dosage details</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "time",            "description": "<p>Dosage timestamp</p>"          }        ]      },      "examples": [        {          "title": "Success-Example: ",          "content": "{\n   \"id\": 2,\n   \"pill\": \"Montek\"\n   \"course\": 4,\n   \"description\": \"Cold, Cough\",\n   \"dosage\": [\n       {\n           \"time\": \"06:00:00\"\n       },\n       {\n           \"time\": \"15:00:00\"\n       }\n   ]\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 401": [          {            "group": "Error 401",            "optional": false,            "field": "Unauthorized",            "description": "<p>Bad Access Token / Bad Doctor Username</p>"          }        ],        "Error 500": [          {            "group": "Error 500",            "optional": false,            "field": "InternalError",            "description": "<p>Database Error</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./apps/nodePillAPI/pillService.js",    "groupTitle": "Pillbottle"  },  {    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "optional": false,            "field": "varname1",            "description": "<p>No type.</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "varname2",            "description": "<p>With type.</p>"          }        ]      }    },    "type": "",    "url": "",    "version": "0.0.0",    "filename": "./docs/main.js",    "group": "_Users_om_Desktop_IOT_Project_docs_main_js",    "groupTitle": "_Users_om_Desktop_IOT_Project_docs_main_js",    "name": ""  }] });
