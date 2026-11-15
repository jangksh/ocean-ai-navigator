// Spanish (Latin American, tú) content for job group 04 (Finance / Accounting / Legal). Keyed '04_<code>'.
// Used when the site language is Spanish. English remains in i18n_en_job04.js; Korean stays in v2_data.js.
window.ES_JOB = window.ES_JOB || {};
(function () {
  function T(name, type, tagline, guide, prompt) { return { name: name, type: type, tagline: tagline, daily_guide: guide, prompt_example: prompt }; }
  function add(code, title, main, spec, o) {
    window.ES_JOB['04_' + code] = {
      title: title,
      mainAI: { name: main, reason: '' },
      specialistAIs: spec.map(function (n) { return { name: n, reason: '' }; }),
      insight: o.i,
      v2: { insight_v2: o.i, strengths: o.s, growth_points: o.g, ai_tools: o.t, synergy_strategy: o.syn, daily_routine: o.day }
    };
  }
  add('00000', 'El realista cínico: la alarma que suena antes de que exista el problema', 'Perplexity', ['Power BI', 'ChatPDF'], {
    i: 'Cuando el equipo dice “este trimestre se ve optimista”, tú abres en silencio el informe de antigüedad de cuentas por cobrar y dices una sola cosa: “Este número se vuelve un problema el mes que viene.” Ahorras energía y hablas poco (extraversión 15%), pero tus alertas suelen acertar. Conservador (apertura 15%) e impasible ante el optimismo (amabilidad 10%), tu realismo es tu arma. Una advertencia sin una presentación puede sonar ligera, así que acompáñala de evidencia visible.',
    s: [
      'Detectas las señales de riesgo primero: marcas puntos raros en cuentas por cobrar, inventario y flujo de caja; eres la alarma del equipo en las revisiones mensuales de riesgo.',
      'Juicio sin emoción: te mantienes en los criterios bajo presión.',
      'Sin esfuerzo de más: informes cortos, con evidencia clara, les ahorran tiempo a quienes los leen.'
    ],
    g: [
      'Las advertencias sin evidencia suenan negativas: adjunta cifras, gráficos y fuentes a cada alerta.',
      'Evitar el choque reduce tu influencia: lleva un registro de las alertas que resultaron ciertas.'
    ],
    t: [T('Perplexity', 'main', 'Del optimismo a una realidad con fuentes', 'Encuentra casos del sector, presentaciones y normas con fuentes, para que tu alerta tenga evidencia detrás.', 'Encuentra cinco empresas cotizadas en las que una cobranza más lenta de cuentas por cobrar fue seguida de un aumento grande en la estimación de incobrables, con fuentes.'),
        T('Power BI', 'specialist', 'Un tablero de alertas que habla por ti', 'Arma un tablero en el que los indicadores clave cambien de color al cruzar un umbral, para que no tengas que discutir.', 'Sugiere un tablero de antigüedad de cuentas por cobrar por tramos que resalte el tramo de más de 90 días cuando supere una proporción definida.'),
        T('ChatPDF', 'specialist', 'Encuentra el lenguaje de riesgo en los documentos', 'Sube revelaciones, contratos e informes de auditoría y pregunta dónde aparece el lenguaje de pasivos contingentes.', 'Resume las notas de este informe sobre contingencias, litigios y garantías, y encuentra oraciones que podrían afectar los estados financieros.')],
    syn: 'El realismo más la IA se vuelve persuasión con evidencia: Perplexity reúne prueba externa, Power BI hace visible el indicador y ChatPDF encuentra el lenguaje de riesgo. Hablas poco, pero tu alerta tiene peso.',
    day: '9:00 Abres el tablero en silencio. Dos indicadores rojos de cuentas por cobrar: les escribes a los responsables. 9:30 Revisas en Perplexity las noticias de los clientes principales; aparece una baja de calificación crediticia. Guardas la fuente. 11:00 Reunión semanal: surge un pronóstico optimista; compartes una página del tablero y una línea: “Este cliente ya pasó los 90 días.” 14:00 Revisas con ChatPDF las condiciones de pago de un contrato nuevo. 15:30 Envías a tu jefe una opinión de riesgo de tres líneas, con enlaces. 17:30 Registras la alerta de hoy para compararla después con los resultados.'
  });
  add('00001', 'El realista de cobranza, a quien no se le mueve el rostro ante las cuentas vencidas', 'Perplexity', ['BlackLine', 'Zapier'], {
    i: '“La fecha de pago ya pasó.” Esa oración, sin emoción, la envías mejor que nadie. La amabilidad 10% pone el efectivo por delante del ánimo, y la estabilidad emocional 90% te deja repetir el trabajo sin cansarte. La extraversión 15% acorta la charla; la baja apertura deja para después los métodos más amables con la relación. Súmale sentido relacional a tu constancia y proteges tanto la tasa de recuperación como la confianza.',
    s: [
      'Cobranza constante: las llamadas difíciles y los recordatorios te cuestan poco a nivel emocional.',
      'Juicio basado en caja: juzgas por lo cobrado, no por los ingresos, y detectas el incobrable a tiempo.',
      'Comunicación clara: avisos cortos reducen los malentendidos.'
    ],
    g: [
      'Subestimas el costo relacional: usa mensajes por etapas que consideren el historial.',
      'Lento ante las excepciones: prepara opciones como planes de pagos.'
    ],
    t: [T('Perplexity', 'main', 'Juzga la cobrabilidad con evidencia', 'Revisa las presentaciones recientes del cliente, noticias de crédito y tendencias del sector antes de cobrar. La estrategia de cobranza cambia con la evidencia.', 'Resume, con fuentes, los cambios de calificación crediticia y las noticias de reestructuración de este cliente en el último año.'),
        T('BlackLine', 'specialist', 'Concilia cobros con facturas', 'Concilia en automático los cobros con las facturas abiertas y muestra solo las que no coinciden.', 'Muestra los cobros de este mes que no coinciden, por cliente.'),
        T('Zapier', 'specialist', 'Recordatorios por etapas, en automático', 'Envía correos de recordatorio por etapas en la fecha de vencimiento, a los 7 días y a los 30 días de atraso, en automático.', 'Diseña un flujo que envíe recordatorios distintos según los días de atraso y avise a ventas después de 30 días.')],
    syn: 'La constancia más la IA se vuelve un sistema de cobranza confiable: Perplexity revisa el riesgo, BlackLine concilia el efectivo y Zapier envía avisos por etapas. Tu tiempo se va a los casos que piden juicio.',
    day: '8:50 Revisas en BlackLine los cobros sin conciliar. 9:30 Envías un correo de confirmación a un cliente. 10:00 Revisas en Perplexity las noticias de un cliente con atraso largo. 11:30 Revisas las respuestas a los recordatorios de Zapier. 14:00 Llamas al responsable de ventas: solo hechos. 15:30 Armas la lista de candidatos a reserva. 17:00 Planificas los tres casos vencidos de mañana.'
  });
  add('00010', 'El contador de respaldo, callado, que cubre los huecos del equipo el día de cierre', 'Gemini', ['Notion AI', 'Zapier'], {
    i: 'El día de cierre encuentras el documento que falta antes de que alguien sepa que falta. La amabilidad 88% te da la sensibilidad para cubrir huecos; tu propia rutina es laxa (responsabilidad 20%), no te gustan los cambios grandes y la presión se acumula por dentro (estabilidad emocional 28%). Lo que va a proteger tu amabilidad son las herramientas, no la fuerza de voluntad: deja que un sistema recuerde dónde se amontonan las solicitudes y cuándo vencen los plazos.',
    s: [
      'Ves primero los huecos del equipo: notas lo que hace falta antes de que alguien lo pida; eso sostiene la semana de cierre.',
      'Un apoyo de confianza: los colegas acuden a ti con facilidad.',
      'Responsabilidad callada: terminas lo que aceptas.'
    ],
    g: [
      'Las solicitudes se acumulan: reúnelas en un solo lugar y ordénalas por prioridad.',
      'La presión se queda adentro: prepara un mensaje corto para pedir ayuda.'
    ],
    t: [T('Gemini', 'main', 'Búsqueda y agenda, delegadas', 'Deja las búsquedas de documentos y la agenda en manos de Gemini, dentro de las herramientas de Google.', 'Encuentra todos los documentos pedidos en este hilo y enumera lo que todavía falta.'),
        T('Notion AI', 'specialist', 'Una sola lista para cada solicitud', 'Reúne las solicitudes en una lista, con responsable y fecha límite.', 'Convierte estos mensajes en una lista de tareas, ordenada por fecha límite.'),
        T('Zapier', 'specialist', 'Recordatorios para ti', 'Recordatorios automáticos antes de cada fecha límite, para que no lo cargues solo.', 'Recuérdame el día anterior a que venza cada tarea de cierre.')],
    syn: 'El cuidado callado más la IA se vuelve una ayuda sostenible: Gemini busca, Notion lista y Zapier recuerda. Tu amabilidad se queda; la tensión baja.',
    day: '9:00 Revisas la lista de solicitudes. 10:00 Buscas documentos faltantes con Gemini. 12:00 Almuerzo. 14:00 Tareas de cierre. 16:00 Recordatorio de Zapier. 17:30 Si el día está apretado, envías el mensaje que ya tenías listo para pedir ayuda.'
  });
  add('00011', 'El asesor relajado: el perezoso de la oficina', 'Gemini', ['Notion AI', 'Zapier'], {
    i: '“Las fechas límite se resuelven solas.” La amabilidad 95% y la estabilidad emocional 92% te hacen una presencia calmada y querida; la baja apertura, responsabilidad y extraversión hacen que los planes y los plazos se escapen debajo del escritorio. Deja que los recordatorios y un tablero simple sostengan tu agenda, para que tu amabilidad nunca sea la razón de que un cierre se atrase.',
    s: [
      'Una presencia que calma: a colegas y clientes les gusta hablar contigo.',
      'Imperturbable: la presión casi no te toca.',
      'Fácil de trabajar en equipo: rara vez generas conflicto.'
    ],
    g: [
      'Los plazos se escapan: usa recordatorios automáticos para cada fecha de vencimiento.',
      'No hay un plan: empieza la semana con una lista de tres puntos.'
    ],
    t: [T('Gemini', 'main', 'Que Gemini cuide la agenda', 'Deja la investigación y la agenda en manos de Gemini, dentro de tus herramientas de Google.', 'Convierte esta lista de tareas en una agenda semanal, con fechas límite y recordatorios.'),
        T('Notion AI', 'specialist', 'Un lugar simple para las tareas', 'Guarda las tareas y las fechas límite en una sola página, simple.', 'Organiza estas tareas por fecha límite y responsable.'),
        T('Zapier', 'specialist', 'Recordatorios en piloto automático', 'Envíate recordatorios automáticos antes de cada fecha límite.', 'Diseña un flujo que me recuerde 2 días y 1 día antes de cada fecha de vencimiento.')],
    syn: 'Lo relajado más la IA se vuelve confiabilidad: Gemini planifica, Notion sostiene la lista y Zapier recuerda. Tu amabilidad se queda; los plazos que se escapaban, no.',
    day: '9:30 Revisas tu lista de tres puntos. 10:30 Resuelves una tarea. 12:00 Almuerzo. 14:00 Recordatorio de Zapier: terminas lo que vence. 16:00 Charlas con colegas. 17:30 Actualizas la lista de mañana.'
  });
  add('00100', 'El dueño de la conciliación de ingresos, que choca con ventas varias veces al día', 'Gemini', ['Microsoft Copilot', 'Zapier'], {
    i: 'Tú y el piso de ventas chocan a diario sobre qué cuenta como ingreso. La extraversión 92% y la baja amabilidad te hacen directo; la estabilidad emocional es baja (20%) y la responsabilidad es 28%, así que los intercambios acalorados y los detalles que se escapan van juntos. Automatiza las revisiones que empiezan las discusiones y deja que la evidencia hable.',
    s: [
      'Directo con ventas: dices lo que hay que decir; eso vale en las revisiones de corte de ingresos.',
      'Energía: le sigues el ritmo a los ciclos rápidos de ventas.',
      'Instinto para las anomalías: sientes cuándo un número no cuadra.'
    ],
    g: [
      'Intercambios acalorados: responde con la referencia de la política, no con una opinión.',
      'Se escapan los detalles: automatiza las revisiones de corte.'
    ],
    t: [T('Gemini', 'main', 'Contrasta con la política', 'Usa los documentos compartidos de política para redactar respuestas claras a las preguntas de ventas sobre el reconocimiento de ingresos.', 'Redacta una respuesta corta que explique por qué este trato no se puede reconocer en este trimestre, citando nuestra política.'),
        T('Microsoft Copilot', 'specialist', 'Excel hace la revisión', 'Revisa fórmulas y marca entradas inusuales de ventas en Excel, con rapidez.', 'Marca en esta hoja las entradas de ventas registradas en los últimos tres días del trimestre.'),
        T('Zapier', 'specialist', 'Alertas, no discusiones', 'Envía una alerta a ventas cuando un registro no trae los documentos requeridos.', 'Diseña un flujo que avise al responsable cuando una orden de venta no tenga un contrato firmado.')],
    syn: 'La franqueza más la IA se vuelve una conciliación basada en evidencia: Gemini cita la política, Copilot marca las entradas y Zapier avisa a los responsables. Menos peleas, cortes más limpios.',
    day: '9:00 Revisas en Excel, con Copilot, las entradas de ventas marcadas. 10:30 Respondes una pregunta de ventas con un borrador de Gemini. 12:00 Almuerzo con ventas. 14:00 Trabajas las alertas de Zapier. 16:00 Te das un respiro antes de responder cualquier mensaje acalorado. 17:30 Registras los pendientes abiertos.'
  });
  add('00101', 'El luchador de controversias fiscales: un mustang en el terreno', 'Grok', ['Otter.ai', 'Beautiful.ai'], {
    i: 'Brillas en la sala donde el inspector presiona y tú presionas de vuelta. La extraversión 92% te da presencia, la estabilidad emocional 85% te mantiene firme y un estilo directo (amabilidad 30%) te hace decisivo. Los registros y la presentación son el punto débil (responsabilidad 32%). Captura lo que se dijo en la sala y preséntalo en diapositivas limpias, y las apelaciones se vuelven mucho más fáciles.',
    s: [
      'Un abogado decisivo: te mueves rápido entre el litigio y el acuerdo; eso destaca en controversia fiscal.',
      'Presencia bajo presión: te mantienes firme en reuniones tensas.',
      'Decisiones rápidas: te comprometes cuando otros dudan.'
    ],
    g: [
      'Los registros quedan delgados: captura cada pregunta y cada respuesta del inspector.',
      'La presentación se atrasa: usa una plantilla para los escritos de posición.'
    ],
    t: [T('Grok', 'main', 'Lee el clima de fiscalización', 'Revisa las tendencias y los fallos de fiscalización más recientes para preparar tus argumentos. Verifica con fuentes primarias.', 'Resume las tendencias recientes de controversia fiscal en auditorías de precios de transferencia. Yo voy a revisar las fuentes.'),
        T('Otter.ai', 'specialist', 'Graba la sala', 'Graba y resume las reuniones con inspectores (con consentimiento), para que las apelaciones tengan evidencia.', 'Resume esta reunión de auditoría, enumerando las preguntas del inspector y nuestras respuestas.'),
        T('Beautiful.ai', 'specialist', 'Escritos de posición, limpios', 'Convierte tus argumentos en diapositivas limpias para las conversaciones de acuerdo.', 'Crea un resumen de cinco diapositivas de nuestra posición sobre la deducción rechazada.')],
    syn: 'El espíritu de lucha más la IA se vuelve un caso documentado: Grok lee el clima, Otter registra y Beautiful.ai presenta. Las posiciones finales necesitan la revisión de un experto.',
    day: '8:30 Revisas en Grok las noticias de fiscalización. 10:00 Reunión con el inspector: Otter la graba. 12:00 Almuerzo. 14:00 Revisas el resumen y listas las preguntas abiertas. 15:30 Armas las diapositivas de posición. 17:00 Envías la carta de seguimiento.'
  });
  add('00110', 'El mejor amigo de finanzas en el negocio: quien saca los números con una sonrisa', 'ChatGPT', ['Loom', 'Otter.ai'], {
    i: 'A los equipos de negocio de verdad les gusta hablar contigo de los números. La extraversión 88% y la amabilidad 95% hacen accesible a finanzas; una estructura relajada (responsabilidad 32%) y una estabilidad emocional más baja hacen que se escapen los detalles y los seguimientos. Graba y resume tus conversaciones, y tus alianzas se van a convertir en decisiones que la gente recuerde.',
    s: [
      'Finanzas accesible: los equipos de negocio te traen preguntas temprano; eso vale en el acompañamiento al negocio.',
      'Explicaciones cálidas: haces que los números sean fáciles de conversar.',
      'Energía relacional: construyes confianza entre departamentos.'
    ],
    g: [
      'Se escapan los detalles: captura las decisiones y los siguientes pasos justo después de cada conversación.',
      'Demasiadas solicitudes: define un horario de atención.'
    ],
    t: [T('ChatGPT', 'main', 'Explícalo en simple', 'Convierte las tablas de variaciones en puntos de conversación, en lenguaje sencillo, para tus socios de negocio.', 'Convierte esta tabla de variaciones frente al presupuesto en cinco puntos, en lenguaje sencillo, para el equipo de ventas.'),
        T('Loom', 'specialist', 'Explícalo una vez, compártelo muchas', 'Graba recorridos cortos de los informes, para que la gente pueda verlos en lugar de volver a preguntar.', 'Arma el esquema de un video de 4 minutos que explique cómo leer el informe mensual de variaciones.'),
        T('Otter.ai', 'specialist', 'Conserva las decisiones', 'Graba y resume las reuniones (con consentimiento), para que no se pierdan las decisiones ni los siguientes pasos.', 'Enumera, por responsable, las decisiones y los siguientes pasos de esta transcripción de reunión.')],
    syn: 'La cercanía más la IA se vuelve decisiones que se sostienen: ChatGPT explica, Loom escala y Otter registra. Las relaciones se convierten en seguimiento.',
    day: '9:00 Armas los puntos de conversación con ChatGPT. 10:00 Recorres los números con un líder de negocio. 12:00 Almuerzo con ventas. 14:00 Grabas un Loom para una pregunta que se repite. 15:30 Revisas el resumen de Otter y envías los siguientes pasos. 17:00 Revisas las solicitudes abiertas.'
  });
  add('00111', 'El rey del networking, despreocupado: el conector', 'ChatGPT', ['Canva Magic', 'Calendly'], {
    i: 'Pasas más tiempo en el after de un seminario que en tu escritorio, y consigues clientes grandes por el encanto y la rapidez. La extraversión 95%, la amabilidad 92% y la estabilidad emocional 90% te mantienen positivo incluso cuando los números no llegan. El papeleo se atrasó (responsabilidad 25%). Deja que la IA arme el seguimiento y cuide tu calendario, y tus relaciones se convierten en negocio registrado.',
    s: [
      'Poder de red: abres puertas a clientes grandes; eso vale en el desarrollo de negocio.',
      'Optimismo que rebota: un mes bajo no te descoloca.',
      'Rapport rápido: a la gente le gusta trabajar contigo.'
    ],
    g: [
      'Se escapa el seguimiento: registra cada promesa justo después de la reunión.',
      'El papeleo se atrasó: deja que la IA redacte propuestas y notas de agradecimiento.'
    ],
    t: [T('ChatGPT', 'main', 'Tú tiras la idea, la IA la arma', 'Suelta la idea y la IA escribe la nota de prensa, la solicitud de patrocinio o el agradecimiento al cliente.', 'Escribe un correo corto de agradecimiento a un cliente después de la reunión de hoy, mencionando los tres temas que conversamos.'),
        T('Canva Magic', 'specialist', 'Lucir bien, rápido', 'Haz invitaciones a eventos y propuestas de una página, sin habilidades de diseño.', 'Crea el diseño de una propuesta de una página para un servicio de asesoría financiera.'),
        T('Calendly', 'specialist', 'Que los clientes te agenden', 'Comparte un solo enlace para que los clientes reserven tu horario disponible y dejes de intercambiar correos.', 'Explícame cómo configurar un enlace de reserva para una llamada de 30 minutos con un cliente, con un buffer de 15 minutos.')],
    syn: 'El networking más la IA se vuelve relaciones que quedan por escrito: ChatGPT escribe, Canva presenta y Calendly agenda. Tú te quedas con el encanto; las herramientas, con el seguimiento.',
    day: '9:00 Revisas en Calendly las reservas de hoy. 10:00 Reunión con un cliente. 12:00 Almuerzo de networking. 14:00 Redactas seguimientos con ChatGPT. 15:30 Armas una página de propuesta en Canva. 17:00 Registras cada promesa que hiciste hoy.'
  });
  add('01000', 'El individualista que concilia el libro hasta el final: un sistema vivo de conciliación', 'Perplexity', ['BlackLine', 'ChatPDF'], {
    i: 'Te quedas solo hasta que el libro cuadre. La responsabilidad 98% y la independencia (extraversión 18%, amabilidad 12%) te hacen un trabajador preciso y solitario; la baja estabilidad emocional hace que las diferencias sin explicación se sientan pesadas. Deja que las herramientas hagan el cruce y la búsqueda de documentos, y reserva tu tiempo para las diferencias que necesitan pensamiento.',
    s: [
      'Precisión en solitario: cuadras los libros por tu cuenta y rara vez dejas cabos sueltos.',
      'Disciplina de proceso: sigues los mismos pasos en cada cierre.',
      'Independencia: casi no necesitas supervisión.'
    ],
    g: [
      'Se salta la coordinación: escribe notas cortas de estado para que los demás sepan dónde estás.',
      'Las diferencias sin explicación te estresan: regístralas con una fecha límite y sigue adelante.'
    ],
    t: [T('Perplexity', 'main', 'Consulta las normas con rapidez', 'Busca normas y orientación con fuentes cuando te encuentres un ítem inusual.', 'Encuentra orientación sobre la contabilización de diferencias intercompañía, con fuentes. Yo verificaré los originales.'),
        T('BlackLine', 'specialist', 'Que el sistema haga el cruce', 'Automatiza el cruce de cuentas y conserva una pista de auditoría de cada conciliación.', 'Muestra las partidas conciliatorias de más de 60 días, por cuenta.'),
        T('ChatPDF', 'specialist', 'Pregúntale a tus PDF', 'Sube estados y contratos y pregunta de dónde sale una cifra.', 'Encuentra la página en la que aparece el importe de 12,480 en este estado y resume su contexto.')],
    syn: 'La precisión en solitario más la IA se vuelve un sistema de cruce: Perplexity confirma las normas, BlackLine concilia y ChatPDF encuentra la fuente. Tú trabajas las diferencias que importan.',
    day: '9:00 Empiezas en silencio en BlackLine. 10:00 Trabajas las partidas conciliatorias más antiguas. 12:30 Almuerzas solo. 14:00 Buscas fuentes en ChatPDF. 15:30 Confirmas un tratamiento en Perplexity. 17:00 Envías una nota corta de estado y terminas.'
  });
  add('01001', 'La calculadora humana: guardián de números sin error', 'Perplexity', ['BlackLine', 'DeepL'], {
    i: 'Para ti, una diferencia mínima nunca es “casi bien”. La responsabilidad 98% y la estabilidad emocional 85% te hacen sereno, preciso y consistente; la baja amabilidad y extraversión hacen que hables poco y de forma directa. Los sistemas que concilian en automático te dejan libres para examinar solo las excepciones que necesitan juicio.',
    s: [
      'Precisión de cero errores: concilias las cuentas hasta el último centavo; eso vale en cierres y auditorías.',
      'Constante y consistente: el mismo estándar, cada vez.',
      'Comunicación eficiente: actualizaciones cortas y factuales les ahorran tiempo a todos.'
    ],
    g: [
      'Un tono demasiado directo: agrega contexto para que la gente entienda por qué importa una diferencia.',
      'Hacerlo todo a mano: automatiza el cruce rutinario.'
    ],
    t: [T('Perplexity', 'main', 'Contrasta el tratamiento con la norma', 'Encuentra orientación y casos con fuentes para confirmar el tratamiento de ítems inusuales.', 'Encuentra orientación sobre la contabilización de reembolsos de impuestos sobre ventas y casos, con fuentes. Yo revisaré los originales.'),
        T('BlackLine', 'specialist', 'Conciliación automática', 'Cruza en automático los saldos de banco, submayor y mayor, y revisa solo las partidas que no coinciden.', 'Lista las partidas sin coincidencia de este mes, por cuenta, las más antiguas primero.'),
        T('DeepL', 'specialist', 'Lee documentos extranjeros con precisión', 'Traduce facturas y políticas extranjeras con exactitud, para que los números y los términos se mantengan intactos.', 'Traduce esta factura y lista todos los importes y fechas en una tabla.')],
    syn: 'La precisión más la IA se vuelve exactitud automática: Perplexity confirma el tratamiento, BlackLine cruza y DeepL lee los documentos extranjeros. Tú revisas solo las excepciones.',
    day: '8:30 Abres BlackLine y revisas las partidas sin coincidencia. 9:30 Investigas dos diferencias. 11:00 Confirmas un tratamiento en Perplexity. 12:30 Almuerzas solo. 14:00 Traduces una factura extranjera con DeepL. 16:00 Escribes una nota corta y factual sobre las excepciones. 17:30 Terminaste.'
  });
  add('01010', 'El procesador amable de gastos, que mantiene en orden los reembolsos de todos', 'Claude', ['Grammarly', 'Zapier'], {
    i: 'Te aseguras de que el informe de gastos de cada empleado se trate con amabilidad y corrección. La responsabilidad 95% y la amabilidad 95% te hacen cuidadoso y considerado; una estabilidad emocional más baja hace que las quejas de quienes atiendes te pesen. Los recordatorios automáticos y un lenguaje claro significan menos conversaciones incómodas, y una versión más estable de ti.',
    s: [
      'Procesamiento cuidadoso: detectas problemas de comprobantes y de política antes del pago.',
      'Comunicación amable: recuerdas a la gente sin que se sienta regañada.',
      'Confiabilidad: los reembolsos salen en la fecha prevista.'
    ],
    g: [
      'Las quejas te pesan: usa plantillas para que tu respuesta sea consistente y menos personal.',
      'Perseguir comprobantes a mano: automatiza los recordatorios.'
    ],
    t: [T('Claude', 'main', 'Recordatorios amables y claros', 'Redacta mensajes de recordatorio corteses pero claros, para comprobantes faltantes y excepciones de política.', 'Escribe un mensaje amable pero claro pidiendo a un empleado que entregue un comprobante faltante antes del viernes.'),
        T('Grammarly', 'specialist', 'Un tono en el que puedes respaldarte', 'Revisa el tono y la claridad de los mensajes antes de enviarlos.', 'Haz que este recordatorio sea cortés pero firme.'),
        T('Zapier', 'specialist', 'Recordatorios automáticos', 'Envía recordatorios automáticos para comprobantes faltantes y aprobaciones.', 'Diseña un flujo que recuerde a los empleados 3 y 7 días antes de una fecha límite de gastos.')],
    syn: 'El cuidado más la IA se vuelve un procesamiento sereno: Claude escribe el mensaje, Grammarly revisa el tono y Zapier envía el recordatorio. Menos charlas incómodas, días más estables.',
    day: '9:00 Revisas los informes de gastos nuevos. 10:00 Envías recordatorios redactados con Claude. 12:00 Almuerzo. 14:00 Revisas el registro de recordatorios de Zapier. 15:30 Procesas los informes aprobados. 17:00 Actualizas la lista de excepciones y terminas.'
  });
  add('01011', 'El ayudante callado: el poder oculto de un despacho fiscal', 'ChatGPT', ['Monday.com', 'Notion AI'], {
    i: 'Nadie lo pide, pero la declaración siempre está lista. La responsabilidad 95%, la amabilidad 90% y la estabilidad emocional 88% te hacen la columna vertebral oculta del despacho. La baja extraversión hace que tu aporte pase desapercibido. Escribe tus procesos en una wiki de preguntas y respuestas y sigue tu trabajo en un tablero: tu valor se vuelve visible y la temporada alta se aligera.',
    s: [
      'Entrega confiable: completas declaraciones y papeles de trabajo con precisión; eso vale en la temporada alta.',
      'Amabilidad bajo presión: ayudas a los colegas sin quejarte.',
      'Una mente estable: te mantienes sereno cuando se amontonan las fechas límite.'
    ],
    g: [
      'Tu trabajo pasa desapercibido: lleva un resumen semanal de lo que completaste.',
      'Aceptas demasiado: usa un tablero para ver la carga y pedir un mejor equilibrio.'
    ],
    t: [T('ChatGPT', 'main', 'Un asistente de preguntas fiscales', 'Convierte las preguntas frecuentes de tu despacho en un Q&A fiscal personalizado, para responder menos correos repetidos.', 'Redacta respuestas a las diez preguntas que más hacen los clientes sobre los pagos de impuestos estimados.'),
        T('Monday.com', 'specialist', 'Ve la carga de trabajo', 'Sigue las declaraciones y las fechas límite en un solo tablero, para que el trabajo sea visible y esté equilibrado.', 'Arma un tablero que muestre el estado, el responsable y la fecha de vencimiento de cada declaración.'),
        T('Notion AI', 'specialist', 'Una wiki de procesos', 'Escribe tus procedimientos una vez en una wiki, para que el equipo los encuentre sin preguntarte.', 'Convierte esta lista de verificación en una página de wiki, con pasos y errores comunes.')],
    syn: 'La confiabilidad callada más la IA se vuelve un valor visible: ChatGPT responde, Monday da seguimiento y Notion documenta. Tu trabajo se ve y tu carga se aligera.',
    day: '9:00 Revisas el tablero en Monday. 10:00 Preparas declaraciones. 12:00 Almuerzo. 13:30 Respondes preguntas de clientes con borradores de ChatGPT. 15:00 Actualizas la wiki en Notion. 17:00 Envías un resumen semanal del trabajo completado.'
  });
  add('01100', 'El líder de control interno que pone las reglas primero: el portero que no admite excepciones', 'Grok', ['Grammarly', 'Otter.ai'], {
    i: 'No das un paso hasta que el control esté por escrito. La responsabilidad 92% y la extraversión 85% te hacen un dueño visible y exigente del control interno; la baja apertura y amabilidad te hacen resistir las excepciones y hablar de forma directa, y la baja estabilidad emocional hace que una falla de control se sienta personal. Los controles que nadie siente como vigilancia son los que funcionan. Automatiza la aplicación y tu equipo puede aceptar las reglas con más facilidad.',
    s: [
      'Disciplina de control: diseñas y pruebas controles sin huecos; eso destaca en SOX y en auditorías internas.',
      'Liderazgo visible: explicas las reglas en las reuniones.',
      'Consistencia: aplicas la misma regla a todos.'
    ],
    g: [
      'No hay espacio para excepciones: define un proceso de excepción, para que los casos urgentes no evadan la regla.',
      'Un tono demasiado directo: pulir las comunicaciones clave.'
    ],
    t: [T('Grok', 'main', 'Sigue los cambios de reglas con rapidez', 'Revisa las noticias regulatorias y las tendencias de fiscalización para que tu marco de control se mantenga actualizado. Verifica con la fuente primaria.', 'Resume los cambios regulatorios de los últimos seis meses que afectan el control interno sobre la información financiera. Yo revisaré las fuentes.'),
        T('Grammarly', 'specialist', 'Firme, pero fácil de leer', 'Pule los avisos de control y las respuestas de auditoría, para que se mantengan firmes pero fáciles de aceptar.', 'Reescribe este aviso de control para que sea firme y profesional, pero no duro.'),
        T('Otter.ai', 'specialist', 'Evidencia de las conversaciones', 'Graba y resume las reuniones de control (con consentimiento), para conservar prueba de las decisiones y las excepciones.', 'A partir de esta transcripción, lista las excepciones aprobadas y quién las aprobó.')],
    syn: 'La disciplina de control más la IA se vuelve controles que la gente acepta: Grok sigue las reglas, Grammarly pule el tono y Otter conserva la evidencia. Las conclusiones finales de control necesitan la revisión de un experto.',
    day: '8:30 Revisas las noticias regulatorias en Grok. 9:30 Revisas los resultados de las pruebas de control. 11:00 Reunión de control: Otter registra las excepciones. 13:00 Almuerzo. 14:30 Pules el aviso de control en Grammarly. 16:00 Actualizas el registro de excepciones. 17:30 Envías la lista de pruebas de mañana.'
  });
  add('01101', 'El guardián estricto de la disciplina: el tigre de la oficina', 'Perplexity', ['BlackLine', 'Clockify'], {
    i: 'El lunes por la mañana un junior entregó un informe de cierre cuya numeración no coincidía con el estándar; lo devolviste de inmediato. “Este tipo de error nos cuesta la confianza de los auditores.” Ese comentario frío y exacto sostiene la disciplina del equipo. La responsabilidad 98% y la estabilidad emocional 88% te mantienen inquebrantable en el principio, y la extraversión 80% te permite dirigir las reuniones. Conservador (apertura 20%) y directo (amabilidad 12%), los juniors te temen, pero te llaman primero en una crisis. Pon tu rigor en los sistemas y el equipo se siente menos vigilado, mientras el cumplimiento se fortalece.',
    s: [
      'Cumplimiento impecable: no se te escapa ningún detalle de la política contable ni del procedimiento de control interno; un modelo para las auditorías.',
      'Serenidad bajo presión: cerca de una fecha límite, juzgas con lógica y sin quemar emoción.',
      'Sistematizar el proceso: recortas los pasos innecesarios, refuerzas los requeridos y reduces los errores repetidos.'
    ],
    g: [
      'El rigor encoge al equipo: comparte los criterios de revisión en documentos, para que los juniors puedan auto-revisarse.',
      'Inflexibilidad: decide de antemano las reglas de excepción.'
    ],
    t: [T('Perplexity', 'main', 'Reglas y normas como hechos', 'Encuentra las normas contables y la orientación administrativa más recientes, con fuentes, y resuelve las preguntas con hechos, no con sentimientos.', 'Resume, con fuentes, las interpretaciones actualizadas recientemente de las normas de reconocimiento de ingresos. Yo revisaré los originales.'),
        T('BlackLine', 'specialist', 'Controles de cierre en un sistema', 'Administra las conciliaciones, las aprobaciones de asientos y la lista de verificación de cierre en un sistema con el que nadie puede discutir.', 'Ordena las tasas de completar las conciliaciones de subsidiarias este trimestre y las partidas con las diferencias más grandes.'),
        T('Clockify', 'specialist', 'Convierte el tiempo de trabajo en datos', 'Registra el tiempo y la eficiencia del equipo como datos, para que las mejoras se apoyen en evidencia.', 'A partir de las horas registradas, lista los tres pasos de cierre que más tiempo tomaron y sugiere mejoras.')],
    syn: 'Los estándares estrictos más la IA se vuelven reglas predecibles: Perplexity confirma la base, BlackLine automatiza el control y Clockify encuentra los cuellos de botella. Los juniors se sienten menos intimidados y el equipo gana precisión.',
    day: '8:30 Revisas en BlackLine las partidas de cierre sin terminar. 9:00 Reunión de equipo: pides solo hechos a los responsables de los atrasos. 10:30 Confirmas en Perplexity la base de una pregunta de un junior. 12:30 Almuerzo. 14:00 Revisas un memo contable de un junior; lo guías a la norma en lugar de rechazarlo. 16:00 Revisas en Clockify los pasos cuello de botella de esta semana. 17:30 Envías la lista de verificación de cierre de mañana y terminas.'
  });
  add('01110', 'El mentor permanente de los contadores junior: firme en el principio, suave en el habla', 'Perplexity', ['Loom', 'Grammarly'], {
    i: 'Cuando revisas el asiento de un junior, explicas con paciencia por qué está mal. La responsabilidad 95% significa que no cedes en el principio, y la amabilidad 88% con la extraversión 82% hacen que tu tono sea suave, para que los juniors pregunten con libertad. Prefieres los métodos comprobados (apertura 30%) y tienes un lado sensible (estabilidad emocional 25%); corregir tú mismo los errores de los demás empuja tu propio trabajo. Pon las explicaciones repetidas en video y en documentos, para que todo el equipo acelere y tú recuperes tiempo.',
    s: [
      'Principio y amabilidad en equilibrio: mantienes los estándares sin aplastar a los juniors; eso destaca en la inducción y en el OJT.',
      'Precisión de revisión: detectas errores en asientos y en paquetes de cierre antes de que se propaguen.',
      'Elevar al equipo: explicar eleva el dominio de las normas de todos.'
    ],
    g: [
      'Corriges en lugar de enseñar: muestra cómo corregir y pídeles que lo rehagan, para que aprendan y tú conserves tu tiempo.',
      'Repetir la misma explicación: graba las preguntas frecuentes como documentos y videos.'
    ],
    t: [T('Perplexity', 'main', 'Encuentra la base antes de explicar', 'Antes de responder la pregunta de un junior, revisa la norma y los casos con fuentes. Las explicaciones precisas les enseñan a encontrar la base por sí mismos.', 'Explica el modelo de cinco pasos de ingresos y cómo estimar la contraprestación variable, con referencias a la norma y ejemplos simples.'),
        T('Loom', 'specialist', 'Un video en lugar de la misma explicación', 'Graba asientos comunes y pasos de cierre como videos de pantalla que los juniors pueden repetir cuando quieran.', 'Sugiere el esquema de un video de 5 minutos que explique cómo amortizar los gastos prepagados en el cierre.'),
        T('Grammarly', 'specialist', 'Suaviza tus comentarios de revisión', 'Pule los comentarios de revisión para que sean precisos y amables, y tu intención se entienda.', 'Reescribe este comentario de revisión para que sea preciso, pero alentador.')],
    syn: 'Enseñar más la IA se vuelve un mentor que se expande: Perplexity encuentra la base, Loom captura la lección y Grammarly suaviza la retroalimentación. Los juniors crecen más rápido; tú recuperas aire.',
    day: '9:00 Revisas los asientos de un junior: comentas en lugar de corregir. 9:30 Confirmas en Perplexity la base de la norma. 10:30 Una reunión uno a uno de 15 minutos. 11:30 Tercera vez con la misma pregunta: grabas un Loom. 13:00 Almuerzo con los juniors. 15:00 Pules en Grammarly los comentarios de revisión en inglés. 16:30 Te concentras en tu propio trabajo de cierre. 17:30 Agregas el enlace del video al documento de inducción.'
  });
  add('01111', 'El manual vivo de contabilidad: el controller en quien todos confían', 'Gemini', ['BlackLine', 'Notion AI'], {
    i: '“Pregúntale al controller.” Conoces mejor que nadie las políticas y los procedimientos, y se los explicas con amabilidad a todos. La responsabilidad 98%, la amabilidad 98%, la estabilidad emocional 95% y la extraversión 85% hacen un equilibrio raro entre principio y personas. Prefieres los métodos comprobados (apertura 35%), y responder tú mismo cada pregunta te deja demasiado poco tiempo. Deja que los documentos y las herramientas respondan las preguntas repetidas, para que puedas concentrarte en el juicio.',
    s: [
      'Un equilibrio que construye confianza: sostienes los principios y te comunicas con calidez, así que los equipos y los socios de negocio te buscan; eres central en los cierres y las auditorías.',
      'Una mente estable: te quedas como el centro del equipo bajo presión.',
      'Precisión procedimental: conoces la política y el procedimiento, y los aplicas de forma consistente.'
    ],
    g: [
      'Respondes tú mismo cada pregunta: repetir respuestas deja menos tiempo para el juicio. Pon la política en un formato que se pueda buscar.',
      'Lento para adoptar métodos nuevos: los pilotos pequeños evitan que la eficiencia se estanque.'
    ],
    t: [T('Gemini', 'main', 'Borradores para las preguntas repetidas', 'Usando los documentos de política contable en tu espacio de trabajo, Gemini redacta respuestas a las preguntas repetidas y reduce el tiempo de explicación.', 'A partir de este documento de política contable, redacta 10 preguntas que suelen hacer los que recién llegan, y sus respuestas.'),
        T('BlackLine', 'specialist', 'El estado del cierre, de un vistazo', 'Administra la lista de verificación del cierre mensual y las conciliaciones de cuentas en un sistema que todo el equipo puede ver.', 'Lista las partidas atrasadas del cierre de este mes, con responsables y un orden sugerido para resolverlas.'),
        T('Notion AI', 'specialist', 'Una wiki de política contable', 'Convierte las políticas y los estándares de tratamiento en una wiki que se pueda buscar, para dejar de responder la misma pregunta una y otra vez.', 'Convierte este memo de tratamiento en una página de wiki, con tres preguntas frecuentes.')],
    syn: 'La confianza más la IA se vuelve un controller que se expande: Gemini redacta las respuestas, BlackLine corre el cierre y Notion documenta los estándares. Tú dedicas tu tiempo al juicio.',
    day: '8:30 Abres el tablero de cierre de BlackLine; hablas con los responsables de dos partidas atrasadas. 9:30 Redactas respuestas a preguntas repetidas con Gemini. 10:30 Preparas las solicitudes de los auditores. 12:00 Almuerzo con el equipo. 14:00 Actualizas la wiki de política en Notion. 15:30 Diriges a los que recién llegan a la wiki. 17:00 Reunión de revisión de cierre. Un día con menos preguntas.'
  });
  add('10000', 'El genio solitario que lee entre líneas las normas', 'Grok', ['NotebookLM', 'DeepL'], {
    i: 'Encuentras un problema de interpretación nuevo en una oración que todos los demás se saltaron. La apertura 98% te atrae a las preguntas sin una sola respuesta correcta, y brillas cuando investigas solo (extraversión 12%). Un tono directo (amabilidad 10%), la sensibilidad (estabilidad emocional 12%) y una disciplina laxa con las fechas límite (responsabilidad 25%) son los puntos débiles. Cuando no coincides con auditores o ejecutivos, tu agudeza se vuelve un arma solo si organizas la evidencia. Deja la organización de evidencia en manos de las herramientas y tu genio se convierte en persuasión.',
    s: [
      'Profundidad al leer las normas: encuentras problemas en una sola oración y diseñas la contabilidad de transacciones complejas; eso vale en las revisiones de transacciones nuevas.',
      'Pensamiento independiente: juzgas por la evidencia, no por la mayoría.',
      'Curiosidad por las interpretaciones nuevas: eres el primero en enterarte de las actualizaciones de las normas.'
    ],
    g: [
      'Una conclusión sin evidencia organizada: un cierre y una documentación débiles dejan buenas interpretaciones como notas. Fija una plantilla de memo.',
      'Un tono demasiado directo: cuando no coincidas, presenta primero la evidencia.'
    ],
    t: [T('Grok', 'main', 'Pon a prueba tu interpretación con la visión contraria', 'Pide el argumento contrario más fuerte a tu lectura de una norma. Encuentra primero el eslabón débil de tu conclusión.', 'Arma el argumento más fuerte en contra de mi lectura sobre si los pagos variables de arrendamiento pertenecen al pasivo. Incluye los párrafos de la norma.'),
        T('NotebookLM', 'specialist', 'Pregúntale a tu conjunto de normas', 'Sube las normas de IFRS y US GAAP y los comentarios, y luego pregúntales para encontrar rápido los párrafos de respaldo.', 'A partir de las normas subidas, encuentra los párrafos relevantes al momento del reconocimiento de ingresos, agrupados por tema.'),
        T('DeepL', 'specialist', 'Lee la fuente con precisión', 'Traduce con precisión las normas extranjeras y las cartas de interpretación, y compara el matiz entre versiones.', 'Traduce los párrafos clave de esta carta de interpretación en inglés y deja los términos importantes en el original.')],
    syn: 'La profundidad de interpretación más la IA se vuelve un genio con evidencia: Grok pone a prueba la visión contraria, NotebookLM encuentra los párrafos y DeepL lee el original. Los juicios contables finales necesitan el texto original y la confirmación de un experto.',
    day: '9:30 Empiezas en silencio; lees el resumen de la transacción nueva. 10:00 Subes las normas a NotebookLM y encuentras los párrafos. 11:00 Le pides a Grok el argumento contrario: encuentras el eslabón débil. 12:30 Almuerzas solo. 14:00 Lees una carta de interpretación extranjera en DeepL. 15:30 Escribes el memo contable con citas de párrafos. 17:00 Abres con un resumen corto y se lo envías a tu jefe.'
  });
  add('10001', 'El investigador independiente de derecho tributario: el cerebro recluso de la investigación fiscal', 'Perplexity', ['DeepL', 'Grammarly'], {
    i: 'Encuentras enfoques razonables de ahorro fiscal en los huecos entre resoluciones y jurisprudencia. La apertura 95% y la estabilidad emocional 88% te permiten empujar hasta el final las interpretaciones difíciles. La extraversión 18% significa que disfrutas investigar solo, y la baja amabilidad te hace directo. La responsabilidad 35% hace fácil posponer organizar las conclusiones y entregarlas. Una plantilla de informe y las herramientas evitan que una buena investigación viva solo en tus notas.',
    s: [
      'Profundidad de interpretación: encuentras los temas entre las leyes y las resoluciones; eso vale en las revisiones de estructuras fiscales complejas.',
      'Una mente estable: empujas hasta el final las preguntas difíciles de interpretación.',
      'Curiosidad: aprendes rápido los cambios de la ley fiscal y los temas de tributación internacional.'
    ],
    g: [
      'Lento para entregar: cuanto más profunda es la investigación, más tarde llega el informe. Usa una plantilla que empiece por la conclusión.',
      'Comunicación demasiado directa: escribe oraciones que lleven tanto tu razonamiento como tu incertidumbre.'
    ],
    t: [T('Perplexity', 'main', 'Un punto de partida rápido para la investigación', 'Encuentra, con fuentes, los cambios e interpretaciones más recientes de la ley fiscal para fijar el punto de partida de la investigación. Confirma siempre con el texto original.', 'Resume, con fuentes, los cambios recientes del crédito fiscal por I+D. Yo revisaré las disposiciones originales.'),
        T('DeepL', 'specialist', 'Documentos de tributación internacional, con precisión', 'Traduce con precisión las reglas fiscales extranjeras y los documentos de la OCDE, para captar rápido los temas de tributación internacional.', 'Traduce los párrafos de precios de transferencia de este documento de la OCDE y lista los términos clave.'),
        T('Grammarly', 'specialist', 'Pule las opiniones en inglés', 'Pule las opiniones fiscales y las respuestas a clientes para que también queden claras en inglés.', 'Pule este borrador de opinión fiscal y déjalo en un inglés claro y profesional.')],
    syn: 'La investigación profunda más la IA se vuelve una investigación que se entrega: Perplexity la inicia, DeepL lee las fuentes extranjeras y Grammarly pule el resultado. Las posiciones fiscales finales necesitan confirmación de las fuentes y la revisión de un experto.',
    day: '9:30 Revisas en Perplexity los cambios de hoy en la ley fiscal. 10:30 Eliges un tema y reúnes respaldo. 12:30 Almuerzas solo. 14:00 Lees con DeepL un documento en inglés de tributación internacional. 15:30 Escribes el memo en una plantilla que empieza por la conclusión. 17:00 Pules la opinión en inglés en Grammarly. 18:00 Envías el informe.'
  });
  add('10010', 'El idealista de la contabilidad de organizaciones sin fines de lucro: darle sentido a los números', 'Claude', ['Notion AI', 'Canva Magic'], {
    i: 'Quieres explicar, como una historia, a dónde fue cada donación. La apertura 95% y la amabilidad 95% te hacen querer sumar números al cambio del mundo. La extraversión 25% te mantiene callado, pero el trabajo repetitivo como archivar documentos y cerrar es una carga (responsabilidad 30%), y las críticas duelen con facilidad (estabilidad emocional 25%). Los donantes confían en los registros transparentes. La empatía más un hábito de archivar es una gran fortaleza.',
    s: [
      'Darle sentido a los números: explicas el uso de las donaciones como una historia que gana la confianza de los donantes; brillas en los informes de actividad de fin de año.',
      'Empatía: entiendes tanto a los donantes como a los beneficiarios.',
      'Enfoques nuevos: pruebas formas frescas de reportar con transparencia.'
    ],
    g: [
      'Los documentos y el cierre se atrasan: archivar una y otra vez es una carga; reúne los comprobantes en un solo lugar.',
      'Las críticas pican: convierte los hallazgos de auditoría en una lista de mejoras.'
    ],
    t: [T('Claude', 'main', 'De números a historia', 'Convierte el uso de las donaciones en historias, en lenguaje sencillo, que los donantes entiendan, y redacta el texto del informe de actividad.', 'Escribe el uso de las donaciones de este trimestre como una carta de agradecimiento a los donantes. Deja todos los números tal como están.'),
        T('Notion AI', 'specialist', 'Comprobantes y registros en un solo lugar', 'Guarda juntos los ingresos por donaciones, los comprobantes de gasto y los registros de actividad, para que el cierre no sea una cacería de papeles.', 'Clasifica los comprobantes de gasto de donaciones de este mes, por programa.'),
        T('Canva Magic', 'specialist', 'Informes de un vistazo', 'Crea con facilidad informes para donantes e infografías de fin de año, para que los números se vean de un vistazo.', 'Sugiere una infografía de una página que muestre los ingresos por donaciones y el gasto, por programa.')],
    syn: 'La empatía más la IA se vuelve una historia transparente: Claude la escribe, Notion la reúne y Canva la muestra. Quédate con el corazón; deja los registros en las herramientas.',
    day: '9:30 Revisas en Notion la lista de comprobantes de esta semana. 10:30 Escribes una carta de agradecimiento a los donantes con Claude. 12:00 Almuerzo. 14:00 Armas en Canva la infografía del trimestre. 15:30 Conviertes las consultas de auditoría en una lista de mejoras. 17:00 Archivas todos los comprobantes de esta semana y cierras el día.'
  });
  add('10011', 'El mediador que calma las guerras de presupuesto: intérprete de números entre departamentos', 'Claude', ['Notion AI', 'Otter.ai'], {
    i: 'Ventas quiere más presupuesto, los ejecutivos quieren menos, y tú escuchas a ambos hasta el final. La amabilidad 98% y la apertura 90% te permiten crear alternativas; la extraversión 25% significa que negocias en voz baja, y la estabilidad emocional 88% te mantiene sereno en el conflicto. La documentación es el punto débil (responsabilidad 35%): los números acordados no quedan por escrito y se discuten de nuevo más tarde. Una herramienta que convierte los acuerdos en registros completa tu mediación.',
    s: [
      'Entender ambos lados: resuelves los conflictos de presupuesto con alternativas; brillas en las conversaciones de presupuesto y en FP&A.',
      'Opciones flexibles: ofreces varios escenarios para llegar a un acuerdo.',
      'Una manera serena: no reaccionas con emoción en el conflicto.'
    ],
    g: [
      'Los acuerdos no quedan registrados: los tratos verbales se reinterpretan. Escribe lo que se acordó justo después de la reunión.',
      'Decisiones atrasadas: tratar de complacer a todos te frena; fija primero la fecha de la decisión.'
    ],
    t: [T('Claude', 'main', 'Convierte las posturas opuestas en un compromiso', 'Pega el memo de presupuesto de cada departamento y pide a Claude que resuma lo que le preocupa a cada lado, y luego redacte compromisos que ambos podrían aceptar.', 'Ventas quiere un aumento y los ejecutivos quieren un recorte. Resume la preocupación central de cada lado y propone tres compromisos.'),
        T('Notion AI', 'specialist', 'De acuerdos a registros', 'Registra en un documento los términos de presupuesto acordados y los responsables, justo después de la reunión, para que el mismo argumento no se repita.', 'A partir de estas notas de reunión, lista los términos de presupuesto acordados, los responsables y las fechas límite.'),
        T('Otter.ai', 'specialist', 'Conserva la prueba de las promesas', 'Graba y resume las reuniones de presupuesto (con consentimiento), para conservar evidencia de quién prometió qué.', 'A partir de este registro de reunión, resume a qué se comprometió cada departamento.')],
    syn: 'La mediación más la IA se vuelve un acuerdo registrado: Claude redacta los compromisos, Notion los deja por escrito y Otter captura las promesas. Los mismos argumentos se reducen y crece la confianza.',
    day: '9:30 Resume en Claude las posturas de presupuesto de Ventas y de los ejecutivos. 10:30 Hablas con el líder de ventas y escuchas la preocupación. 11:30 Redactas un compromiso. 14:00 Reunión de presupuesto: Otter la graba. 15:30 Escribes el acuerdo en Notion y se lo envías a ambos lados. 17:00 Para lo que quedó sin resolver, escribes una fecha de decisión. 18:00 Cierras el día.'
  });
  add('10100', 'El maverick de tesorería que gana las negociaciones bancarias por instinto', 'Grok', ['Zapier', 'Feedly AI'], {
    i: 'Cuando un banco se resiste a las condiciones de un préstamo, das vuelta la mesa con intuición y presencia. La apertura 94% y la extraversión 85% traen alternativas audaces y atraes a la gente. Prefieres el instinto a la teoría y el cara a cara al papeleo (responsabilidad 30%), y tu estilo directo viene de una amabilidad baja. Con una estabilidad emocional baja, una negociación estancada puede hacer que tus palabras se pongan rudas. Los vencimientos y el seguimiento de covenants son puntos débiles: deja que los sistemas cuiden el calendario, para que tú te concentres en la jugada.',
    s: [
      'Un negociador en la mesa: tomas la delantera en tasas y límites; eso vale en las negociaciones de líneas bancarias.',
      'Alternativas creativas: propones condiciones estructuradas de formas nuevas.',
      'Impulso: te reúnes rápido y cierras rápido.'
    ],
    g: [
      'Se escapan las fechas de detalle: perder un vencimiento o una revisión de covenant es costoso; automatiza los recordatorios.',
      'La emoción toma la delantera: después de negociaciones difíciles, espera un día antes de responder.'
    ],
    t: [T('Grok', 'main', 'Lee primero el ánimo del mercado', 'Revisa en tiempo real las tasas, el tipo de cambio y las noticias del mercado, para entender la lógica del otro lado y el ánimo del mercado antes de una negociación.', 'Resume las tendencias del último mes de la tasa de política monetaria y de los bonos corporativos, y los puntos de negociación para un préstamo. Yo verificaré los números.'),
        T('Zapier', 'specialist', 'Vencimientos y covenants en un sistema', 'Recibe alertas automáticas de vencimientos de préstamos, fechas de intereses y revisiones de covenant: el sistema cuida el calendario, no tu ánimo.', 'Diseña un flujo que me avise 30 y 7 días antes del vencimiento de un préstamo y pida confirmación en las fechas de pago de intereses.'),
        T('Feedly AI', 'specialist', 'Las noticias financieras, en un solo lugar', 'Reúne las noticias de tasas y de regulación, y revisa solo lo que cambió antes de una negociación.', 'Resume las cinco historias clave de hoy sobre regulación financiera y tasas de interés.')],
    syn: 'El instinto de negociación más la IA se vuelve una jugada con evidencia: Grok lee el mercado, Zapier cuida las fechas y Feedly reúne las noticias. Tú ganas el trato; el sistema se encarga de lo administrativo.',
    day: '9:00 Revisas las noticias financieras en Feedly AI. 9:30 Armas con Grok los puntos de conversación para la reunión de hoy con el banco. 11:00 Negocias: instinto más evidencia. 13:00 Escribes el resultado. 14:30 Una alerta de Zapier te recuerda el pago de intereses de la próxima semana. 16:00 Dejas cualquier respuesta acalorada para mañana. 17:30 Revisas la lista de covenants y te vas.'
  });
  add('10101', 'El líder de IR que vende los números como una historia', 'Grok', ['Pitch.com', 'Feedly AI'], {
    i: 'Los números correctos no bastan; crees que los inversionistas necesitan una razón para comprar. La apertura 90% y la extraversión 92% te hacen brillar en el escenario, y la estabilidad emocional 85% evita que las preguntas duras te descoloquen. La baja amabilidad te da un estilo de persuasión directo, y la baja responsabilidad (28%) significa que un número puede estar mal justo antes de una presentación. Tú cuentas la historia; deja que las herramientas revisen los números y también vas a ganarte la confianza.',
    s: [
      'Convertir los números en historia: persuasivo en las presentaciones de resultados y en las reuniones con inversionistas; destaca en IR y en la captación de fondos.',
      'Serenidad bajo presión: las preguntas duras no te descolocan.',
      'Armar una línea narrativa con rapidez: armas narrativas de inversión rápido.'
    ],
    g: [
      'Pequeños deslices numéricos: contrasta con herramientas los números de las diapositivas antes de presentar.',
      'Persuasión demasiado directa: lista primero las preocupaciones de los inversionistas y respóndelas.'
    ],
    t: [T('Grok', 'main', 'Lee cómo está reaccionando el mercado', 'Revisa los resultados de los competidores y la reacción del mercado, para encontrar qué líneas conectan con los inversionistas.', 'Resume las preguntas que más hicieron los inversionistas en las últimas llamadas de resultados de pares. Yo revisaré las fuentes.'),
        T('Pitch.com', 'specialist', 'Diapositivas de resultados, rápido', 'Arma con el equipo las diapositivas de resultados trimestrales: actualiza los números y mantén el diseño consistente.', 'Sugiere un esquema de diapositivas para una presentación de resultados trimestrales, armado alrededor de tres mensajes clave.'),
        T('Feedly AI', 'specialist', 'Noticias del sector, cada mañana', 'Reúne las noticias del sector y los cambios de regulación, para poder responder primero las preguntas de los inversionistas.', 'Resume las cinco historias principales de hoy en nuestro sector y las preguntas que pueden hacer los inversionistas.')],
    syn: 'La persuasión más la IA se vuelve una historia con evidencia: Grok lee el mercado, Pitch arma las diapositivas y Feedly te mantiene al día. La historia, de ti; el armado, de las herramientas.',
    day: '9:00 Revisas las noticias del sector en Feedly AI. 9:30 Listas con Grok las preguntas probables de los inversionistas. 11:00 Actualizas los números en Pitch. 14:00 Reunión con inversionistas: primero la historia, después la evidencia. 16:00 Registras las preocupaciones después de la reunión y las compartes con el equipo. 17:30 Escribes una lista de verificación de números para las siguientes diapositivas.'
  });
  add('10110', 'El showman entrañable del despacho: las ideas explotan, el archivo no', 'ChatGPT', ['Beautiful.ai', 'Calendly'], {
    i: '“¡La oficina de impuestos es el héroe, y nuestro cliente es el actor de apoyo agraviado!” Explicas temas fiscales complejos como el tráiler de una película y haces reír a la sala. La apertura 95%, la extraversión 95% y la amabilidad 92% te ayudan a conectar y a tranquilizar a los clientes. Pero la baja responsabilidad (32%) convierte los informes de fin de año y las notas de reunión en carreras de último minuto. Las herramientas que estructuran tus ideas al instante convierten el magnetismo en un trabajo confiable.',
    s: [
      'Confianza rápida con el cliente: explicas temas complejos de finanzas e impuestos de una forma fácil y divertida; eso destaca en las reuniones con clientes.',
      'Propuestas creativas: ofreces ideas de impuestos y de estructura fuera de lo habitual.',
      'Energía de equipo: tu positividad levanta al equipo en la temporada alta.'
    ],
    g: [
      'Se escapa lo administrativo: fija en tu calendario un horario fijo de archivo, para que los paquetes de fin de año no se amontonen.',
      'Las prioridades se nublan: elige los tres principales de cada semana.'
    ],
    t: [T('ChatGPT', 'main', 'De ideas sueltas a una estructura', 'Convierte notas de voz e ideas en una lista priorizada y un borrador de propuesta.', 'Ordena estas notas por prioridad y arma una lista de verificación de los materiales que necesito para cada una.'),
        T('Beautiful.ai', 'specialist', 'Tú hablas, ella arma las diapositivas', 'Ingresa los puntos clave y obtén diapositivas limpias, para que puedas concentrarte en la presentación.', 'Crea una diapositiva por trimestre que muestre el impuesto esperado, los principales factores de cambio y resalte las partidas de riesgo.'),
        T('Calendly', 'specialist', 'Protege tu tiempo', 'Deja que los clientes reserven tus horarios disponibles y reserva un bloque fijo de revisión de cierre antes de cada fecha límite.', 'Explícame cómo configurar las consultas con clientes de 10 a 12 a. m. y el tiempo de revisión de cierre los viernes de 2 a 5 p. m.')],
    syn: 'El poder de las ideas más la IA se vuelve creatividad organizada: ChatGPT estructura, Beautiful.ai presenta y Calendly protege tu tiempo. La creatividad, de ti; lo administrativo, de las herramientas.',
    day: '8:30 Ordenas con ChatGPT las notas de voz del fin de semana. 9:30 Preparas una reunión con un cliente. 10:00 Reunión: explicas un tema fiscal con una analogía simple. 12:00 Armas en Beautiful.ai las diapositivas de recap. 14:00 Tu bloque protegido de revisión de cierre: no se pospone. 16:00 Revisas la agenda de mañana. 17:30 Anotas tres ideas nuevas y cierras el día.'
  });
  add('10111', 'El evangelista de la innovación contable: normas nuevas, herramientas nuevas', 'ChatGPT', ['NotebookLM', 'Gamma'], {
    i: 'Lees primero las normas contables nuevas, pruebas primero las herramientas nuevas y contagias la emoción a todo el equipo. La apertura 96%, la extraversión 92% y la amabilidad 94% hacen natural el “hagámoslo juntos”, y la estabilidad emocional 90% evita que la oposición te moleste. Tu punto débil es el seguimiento (responsabilidad 28%): las propuestas brillan y el seguimiento se apaga. Una lista de verificación y un calendario convierten tu entusiasmo en resultados.',
    s: [
      'Difundir el cambio: explicas las normas y las herramientas nuevas para que los equipos se resistan menos; eso destaca en la adopción de normas y en las puestas en marcha de sistemas.',
      'Juntos: construyes cooperación entre departamentos.',
      'Optimismo estable: los contratiempos ruedan hacia el siguiente intento.'
    ],
    g: [
      'Un comienzo fuerte, un final débil: para cada iniciativa, escribe el responsable, la fecha límite y la medida de éxito en una sola página.',
      'Demasiadas cosas a la vez: limita a dos los proyectos de mejora activos.'
    ],
    t: [T('ChatGPT', 'main', 'De ideas a un plan de ejecución', 'Convierte una idea de una norma o una herramienta nueva en una lista de verificación, paso a paso, y un cronograma, antes de que se apague la emoción.', 'Crea un plan de 8 semanas para adoptar la nueva norma de arrendamientos, con responsables, entregables y puntos de control, en una tabla.'),
        T('NotebookLM', 'specialist', 'De normas a material de capacitación', 'Sube la norma nueva y la orientación, haz preguntas y produce un resumen de capacitación para el equipo.', 'A partir de la norma subida, lista los cambios que afectan nuestra contabilidad, por tema.'),
        T('Gamma', 'specialist', 'Diapositivas de propuesta en minutos', 'Redacta rápido la propuesta de adopción y las diapositivas de capacitación, y compártelas mientras la energía está alta.', 'Arma el esquema de una propuesta de 7 diapositivas para un sistema contable nuevo, incluyendo costo, beneficio, riesgo y cronograma.')],
    syn: 'La energía de innovación más la IA se vuelve una adopción que se termina: ChatGPT planifica, NotebookLM enseña y Gamma comparte. Tú traes la energía; las herramientas, la estructura.',
    day: '9:00 Pides a ChatGPT una lista de verificación para el proyecto de mejora de hoy. 10:00 Subes la norma nueva a NotebookLM. 11:30 Explicas los cambios en la reunión de equipo. 14:30 Redactas las diapositivas de capacitación en Gamma. 16:00 Revisas si tienes más de tres proyectos abiertos y pausas uno. 17:30 Escribes el responsable, la fecha límite y la medida de éxito en una sola página.'
  });
  add('11000', 'El artesano sensible al que le importa el sentido de una celda de Excel', 'Claude', ['Microsoft Copilot', 'Power BI'], {
    i: 'Llevas en la cabeza un mapa de lo que se mueve cuando cambia un supuesto. La apertura 92% y la responsabilidad 90% construyen una estructura precisa; brillas solo (extraversión 20%). La baja amabilidad hace que tus correcciones sean directas, y la baja estabilidad emocional significa que un error encontrado duele. Un modelo que no llega a sus usuarios está a medias: deja la verificación y lo visual en las herramientas, y tu oficio se convierte en el lenguaje de la organización.',
    s: [
      'Diseño estructural: separas supuestos, cálculos y resultados; eres de confianza en presupuestos, pronósticos y modelos de valuación.',
      'Revisión precisa: cazas errores de fórmulas y referencias circulares.',
      'Enfoque independiente: terminas solo modelos complejos de escenarios.'
    ],
    g: [
      'Los errores del modelo te descolocan: usa una lista de verificación y dobles chequeos con herramientas para reducir el golpe.',
      'El modelo no llega a quienes nunca abren Excel: practica resúmenes visuales de una página.'
    ],
    t: [T('Claude', 'main', 'Una revisión más antes de compartir', 'Explica tus supuestos y tu flujo, y pídele a Claude que encuentre huecos de lógica antes de que lo haga alguien más.', 'Revisa estos supuestos (crecimiento de ingresos, razón de costos, días de capital de trabajo) y marca los que sean irrealistas o contradictorios.'),
        T('Microsoft Copilot', 'specialist', 'Sigue las fórmulas más rápido', 'Sigue los errores de fórmulas y las celdas dependientes dentro de Excel cuando cambias un escenario.', 'Encuentra en esta hoja las celdas con referencias circulares o valores fijos y lístalas.'),
        T('Power BI', 'specialist', 'Los resultados del modelo, como un tablero', 'Conecta los modelos terminados a un tablero, para que quienes nunca abren Excel puedan ver los números.', 'Sugiere un tablero que compare el resultado operativo y el flujo de caja, por escenario.')],
    syn: 'El oficio de modelar más la IA se vuelve un modelo en el que la gente confía: Claude pone a prueba los supuestos, Copilot sigue los errores y Power BI entrega los resultados. El juicio final del modelo es tuyo.',
    day: '9:30 Empiezas en silencio; Copilot revisa las ediciones de ayer. 10:30 Pegas los supuestos en Claude para buscar contradicciones. 12:30 Almuerzas solo. 14:00 Comparas tres escenarios. 15:30 Armas una vista de Power BI de los resultados clave. 17:00 Compartes un resumen de una página del modelo. 18:00 Confirmas la lista de verificación y te vas.'
  });
  add('11001', 'El analista obsesionado con los datos, que encuentra anomalías en los libros', 'Perplexity', ['Power BI', 'NotebookLM'], {
    i: 'Sientes una alegría real al encontrar la única línea que no pertenece entre decenas de miles de transacciones. La apertura 95% y la responsabilidad 92% te permiten llegar hasta el final; la estabilidad emocional 88% te mantiene en marcha. La baja extraversión y amabilidad hacen que tus hallazgos salgan cortos y directos, y un buen hallazgo que no se acepta desaparece. Agrega evidencia y visuales a tus explicaciones, para que el análisis se convierta en acción.',
    s: [
      'Un ojo para las anomalías: detectas patrones sutiles de transacciones; eso vale en las pruebas de control interno y en las revisiones analíticas.',
      'Verificación incansable: pruebas una hipótesis contra los datos hasta el final.',
      'Enfoque inquebrantable: los conjuntos grandes de datos no te agotan.'
    ],
    g: [
      'Los hallazgos suenan cortos y directos: usa un formato de memo hecho → impacto → propuesta.',
      'Demasiadas hipótesis: fija el alcance y un límite de tiempo desde el inicio.'
    ],
    t: [T('Perplexity', 'main', 'Pon fuentes detrás de los números', 'Encuentra casos del sector, normas contables y revelaciones que expliquen lo que encontraste.', 'Resume, con fuentes, los errores comunes de corte en el reconocimiento de ingresos y los casos encontrados en auditorías.'),
        T('Power BI', 'specialist', 'Ve el patrón', 'Corta miles de transacciones por cuenta, contraparte y fecha, para detectar visualmente patrones inusuales.', 'Sugiere un tablero de ventas mensuales por cliente que resalte los valores atípicos.'),
        T('NotebookLM', 'specialist', 'Pregúntale a tu carpeta de evidencia', 'Sube PDF de evidencia y contratos, y pregunta dónde está el respaldo de una transacción.', 'A partir de los contratos subidos, encuentra los términos que podrían afectar el momento del reconocimiento de ingresos, párrafo por párrafo.')],
    syn: 'El instinto analítico más la IA se vuelve hallazgos que llevan a la acción: Perplexity agrega evidencia, Power BI muestra el patrón y NotebookLM revisa los documentos. Las conclusiones finales necesitan evidencia de las fuentes y la revisión de un experto.',
    day: '9:30 Empiezas en silencio; revisas las transacciones de ayer en busca de patrones. 10:30 Desglosas en Power BI las partidas sospechosas. 12:30 Almuerzas solo. 14:00 Revisas los términos de contratos en NotebookLM. 15:30 Encuentras casos similares en Perplexity. 16:30 Escribes un memo hecho → impacto → propuesta. 17:30 Se lo envías al responsable.'
  });
  add('11010', 'El romántico de principios: el socio CPA sensible', 'Claude', ['Notion AI', 'Otter.ai'], {
    i: 'Te encanta la elegancia de un libro bien llevado, y sientes cada comentario sobre tu trabajo. La apertura 98% y la responsabilidad 95% te hacen un artesano cuidadoso; la amabilidad 92% te hace un socio atento. La baja extraversión y la baja estabilidad emocional significan que prefieres escribir a las reuniones y tomas las críticas a pecho. Deja que la IA redacte, grabe y organice, para que tu energía se vaya al oficio y a las relaciones.',
    s: [
      'Oficio y cuidado: tus informes son rigurosos y considerados con los lectores.',
      'Calidez con principios: sostienes los estándares sin dureza.',
      'Resolución creativa de problemas: encuentras formas nuevas de presentar números complejos.'
    ],
    g: [
      'Las críticas se quedan: convierte los comentarios en una lista de acciones, en lugar de revivirlos.',
      'Las reuniones te agotan: pide agendas con anticipación y envía seguimientos por escrito.'
    ],
    t: [T('Claude', 'main', 'Un primer borrador amable', 'Redacta correos sensibles y comentarios de revisión con un tono cálido y claro, y luego edita.', 'Redacta una respuesta a esta pregunta del cliente que sea precisa, amable y de menos de 150 palabras.'),
        T('Notion AI', 'specialist', 'Guarda tus notas en un solo lugar', 'Reúne notas de reunión, normas y pendientes en un solo espacio de trabajo que puedas buscar.', 'Organiza estas notas de reunión en decisiones, responsables y fechas límite.'),
        T('Otter.ai', 'specialist', 'Que alguien más tome las minutas', 'Graba y resume las reuniones (con el consentimiento de los participantes), para que puedas escuchar en lugar de escribir.', 'Resume esta transcripción de reunión en elementos de acción, por responsable.')],
    syn: 'La sensibilidad de principios más la IA se vuelve un oficio protegido: Claude redacta, Notion guarda y Otter registra. Tú dedicas tu energía a donde importa.',
    day: '9:30 Empiezas con las prioridades por escrito en Notion. 10:30 Redactas respuestas a clientes con Claude. 12:30 Almuerzo en silencio. 14:00 Reunión: Otter toma las notas. 16:00 Conviertes los comentarios en una lista de acciones. 17:30 Envías los seguimientos por escrito y cierras el día.'
  });
  add('11011', 'El poder callado en la sala de auditoría', 'Perplexity', ['Notion AI', 'DeepL'], {
    i: 'Mientras los demás debaten, tú ya leíste las notas al pie. La apertura 92% y la responsabilidad 96% te dan una profundidad rara en temas de auditoría; la amabilidad 95% y la estabilidad emocional 92% te mantienen sereno y amable. La baja extraversión significa que tus hallazgos pueden quedarse en tus notas. Captura lo que sabes en documentos y plantillas, para que tu expertise callado llegue a quienes lo necesitan.',
    s: [
      'Una profundidad que a otros se les escapa: lees las normas y la evidencia de cerca; eso vale en auditoría interna y en revisiones técnicas.',
      'Sereno y amable: entregas hallazgos difíciles sin drama.',
      'Enfoque independiente: trabajas bien, solo, con conjuntos grandes de evidencia.'
    ],
    g: [
      'Los hallazgos se quedan en tu cabeza: usa una plantilla fija de memo, para que el trabajo se vuelva visible.',
      'Quedarte callado en las reuniones: envía una lectura previa corta, para que se escuche tu punto de vista.'
    ],
    t: [T('Perplexity', 'main', 'Respalda cada hallazgo con una fuente', 'Encuentra normas, casos y presentaciones, con citas, para respaldar lo que notaste.', 'Encuentra orientación autorizada sobre la clasificación de modificaciones de arrendamiento, con citas. Yo revisaré los originales.'),
        T('Notion AI', 'specialist', 'Una wiki de auditoría que se puede buscar', 'Convierte tus notas en una wiki que se puede buscar, de listas de verificación y precedentes.', 'Convierte estas notas de auditoría en una página de wiki, con una lista de verificación y tres hallazgos comunes.'),
        T('DeepL', 'specialist', 'Lee las normas extranjeras con precisión', 'Traduce con precisión la orientación extranjera y las políticas de grupo, para que no se pierda nada en la traducción.', 'Traduce este párrafo de orientación y deja los términos clave en el idioma original, a un lado.')],
    syn: 'La profundidad callada más la IA se vuelve un expertise visible: Perplexity cita, Notion guarda y DeepL traduce. Las conclusiones finales de auditoría se apoyan en la evidencia original.',
    day: '9:30 Empiezas en silencio; revisas las notas de ayer. 10:30 Encuentras en Perplexity las referencias de un hallazgo. 12:30 Almuerzas solo. 14:00 Lees un documento de política extranjera con DeepL. 15:30 Escribes el memo de hallazgo usando tu plantilla. 17:00 Envías una lectura previa de una página para la reunión de mañana.'
  });
  add('11100', 'El estratega fiscal ambicioso y futuro socio director', 'Grok', ['NotebookLM', 'Grammarly'], {
    i: '“Esa estimación: ¿hay un documento fuente?” Una pregunta tuya ha obligado, alguna vez, a rehacer todo un proyecto. La apertura 92%, la responsabilidad 95% y la extraversión 88% te permiten diseñar la estrategia fiscal y explicarla con facilidad. La baja estabilidad emocional hace difícil tolerar los errores pequeños, y la baja amabilidad hace que tu retroalimentación sea lo bastante aguda como para lastimar la moral. Quédate con el filo, cambia la forma de entregarlo, y el camino a socio se acorta.',
    s: [
      'Diseñar el ahorro fiscal: sopesas juntos los portafolios de activos, las donaciones y la estructura corporativa; eso destaca en auditorías y en asesoría.',
      'El ojo de un cazador de errores: detectas erratas pequeñas y saltos de lógica.',
      'Persuasivo hacia afuera: planteas tu lógica con claridad a clientes y autoridades.'
    ],
    g: [
      'La retroalimentación aguda lastima la moral: abre con algo que se hizo bien antes de criticar.',
      'Hacerlo solo: reserva tiempo para desarrollar a los juniors, para que crezca la capacidad del equipo.'
    ],
    t: [T('Grok', 'main', 'Sigue la dirección fiscal en tiempo real', 'Revisa la dirección más reciente de la autoridad fiscal y los cambios de ley, para poner a prueba tu estrategia. Confirma siempre con la fuente primaria.', 'Resume los cambios recientes del impuesto sobre sucesiones y donaciones, con precauciones prácticas. Yo verificaré las referencias legales.'),
        T('NotebookLM', 'specialist', 'Pregúntale a tu biblioteca fiscal', 'Sube los cambios de ley y las resoluciones, y haz preguntas para encontrar rápido la base de tu estrategia.', 'A partir de las resoluciones subidas, lista el tratamiento fiscal que aplica a una transferencia de acciones, agrupado por tema.'),
        T('Grammarly', 'specialist', 'De agudo a pulido', 'Suaviza la retroalimentación aguda y déjala en un inglés de negocios seguro y respetuoso, sin perder el punto.', 'Reescribe este comentario de revisión para que se mantenga preciso, pero respetuoso. Deja el contenido igual.')],
    syn: 'Un estratega fiscal agudo más la IA se vuelve uno persuasivo: Grok lee la dirección, NotebookLM encuentra la base y Grammarly pule el tono. Las posiciones fiscales finales necesitan confirmación de la fuente primaria y de un experto.',
    day: '8:30 Revisas en Grok los desarrollos fiscales. 9:30 Armas en NotebookLM la base de un caso de asesoría. 11:00 Reunión con un cliente: explicas la estrategia con claridad. 14:30 Revisas el informe de un junior y empiezas por lo que salió bien. 16:00 Revisas en Grammarly el tono de tu correo de revisión. 17:30 Listas las referencias legales que verificaste.'
  });
  add('11101', 'El dealmaker frío: la hoja de M&A', 'Grok', ['Tableau', 'Claude'], {
    i: '“Por los números, hay tres razones para no hacer este trato.” Nada de lo que la otra parte pone sobre la mesa te descoloca. La responsabilidad 95% y la apertura 90% te permiten revisar a fondo los archivos de due diligence; la extraversión 82% te permite dirigir la sala; la estabilidad emocional 88% te mantiene sereno bajo presión. El punto débil: un estilo de amabilidad baja puede leerse como frío, y eso cuesta cooperación. Agrega un colchón a tu forma de entregarlo y tus tratos se cierran con más frecuencia.',
    s: [
      'Un juicio frío y claro: sopesas los pros y los contras de un trato a partir de los números de due diligence; eso vale en M&A y en las revisiones de inversión.',
      'Dominio de la mesa: sereno bajo presión, diriges las condiciones.',
      'Due diligence rigurosa: encuentras los huecos en los datos financieros.'
    ],
    g: [
      'Los mensajes demasiado directos congelan las relaciones: pule los correos importantes con un colchón de cortesía.',
      'Cerrar el trato gana a integrarlo: arma un sistema para seguir las tareas de integración posterior al trato, al mismo ritmo.'
    ],
    t: [T('Grok', 'main', 'Lee el mercado en tiempo real', 'Revisa en vivo las noticias de la empresa y las señales del mercado, para entender a la contraparte antes de negociar.', 'Resume las transacciones de M&A en este sector del último año, con múltiplos y la reacción del mercado. Yo verificaré las fuentes.'),
        T('Tableau', 'specialist', 'Los datos de due diligence, de un vistazo', 'Visualiza los datos de due diligence, para que tu análisis se pruebe solo ante el cliente.', 'Sugiere un tablero que compare tres años de ingresos, resultado operativo y capital de trabajo del objetivo.'),
        T('Claude', 'specialist', 'Agrega cortesía a los términos secos', 'Reescribe avisos de términos cortantes con la cortesía mínima, para que el mensaje se mantenga firme, pero educado.', 'Reescribe este aviso de términos en un tono firme pero cortés, sin cambiar ningún término.')],
    syn: 'El juicio frío más la IA se vuelve un juicio persuasivo: Grok lee el mercado, Tableau muestra el due diligence y Claude pule el tono. La valuación y las decisiones de contrato siguen necesitando la revisión de un experto.',
    day: '8:30 Revisas en Grok las noticias del objetivo. 9:30 Armas en Tableau los gráficos de due diligence. 11:00 Reunión de estrategia. 14:00 Negocias: sostienes las condiciones con firmeza. 16:00 Pules el correo de seguimiento con Claude. 17:30 Actualizas la lista de tareas de integración.'
  });
  add('11110', 'El gestor de riesgo que carga una muñeca de las preocupaciones', 'Claude', ['Tableau', 'Zapier'], {
    i: '“¿Y si se me escapó algo?” Vuelves a abrir la conciliación a las 2 de la mañana, después de enviar el informe de cierre, y eres la red de seguridad de tu equipo. Una responsabilidad, apertura y amabilidad altas te hacen minucioso y amable, pero la baja estabilidad emocional hace que las críticas pequeñas se sientan como fracasos. No puedes quitarte la preocupación, pero sí puedes decidir a dónde va: deja que las herramientas vigilen de noche, para que tú puedas pensar y comunicarte de día.',
    s: [
      'Detectas lo que falta: las revisiones de cierre y las pruebas de control se apoyan en tu ojo.',
      'Comunicación atenta: entregas las correcciones de una forma que la gente puede aceptar.',
      'Aprendes rápido las reglas nuevas: las actualizaciones de normas y los cambios regulatorios te resultan fáciles.'
    ],
    g: [
      'La preocupación se come tu tiempo: configura alertas automáticas para umbrales y deja ir el resto.',
      'Una crítica pequeña duele: separa los hechos de los sentimientos cuando registres la retroalimentación.'
    ],
    t: [T('Claude', 'main', 'Un compañero sereno para los momentos de ansiedad', 'Escribe lo que te preocupa y Claude lo divide en “revisar hoy” y “puede esperar”. También suaviza el tono de los mensajes sensibles.', 'Listé 7 preocupaciones de cierre. Sepáralas entre lo que debo verificar hoy y lo que puede esperar hasta mañana.'),
        T('Tableau', 'specialist', 'Convierte la preocupación en números', 'Arma un tablero de partidas conciliatorias abiertas, asientos manuales y cuentas atrasadas, para que la preocupación se vuelva una lista medible.', 'Sugiere un tablero de riesgo que muestre las partidas conciliatorias abiertas y los asientos de ajuste, por mes.'),
        T('Zapier', 'specialist', 'Avísame cuando importe', 'Envía una alerta en automático cuando un indicador cruce su umbral, para que dejes de revisar toda la noche.', 'Diseña un flujo que me avise cuando las partidas conciliatorias abiertas superen 20 y notifique al equipo responsable.')],
    syn: 'La preocupación cuidadosa más la IA se vuelve seguridad por sistema: Claude ordena tus inquietudes, Tableau las mide y Zapier las vigila. El juicio final se queda contigo.',
    day: '8:30 Revisas el tablero en busca de indicadores por encima del umbral. 9:30 Ordenas tus preocupaciones con Claude. 11:00 Reunión de revisión de cierre: empiezas la retroalimentación con hechos. 14:30 Hablas con el responsable de cualquier partida atrasada. 16:00 Revisas tus reglas de alerta. 17:30 Dejas en la lista solo las revisiones de mañana y te vas a casa.'
  });
  add('11111', 'Números, estrategia y personas: el futuro CFO y todoterreno de finanzas', 'Gemini', ['AlphaSense', 'Tableau'], {
    i: 'Traes profundidad con los números, amplitud en la estrategia y el magnetismo para mover a las personas. Tus cinco rasgos son altos —una mezcla rara—, así que puedes analizar el estado de resultados por la mañana y explicar la estrategia a la junta por la tarde. El detalle: eres bueno en tantas cosas que intentas hacerlas todas tú. Deja el análisis y el reporte repetidos en las herramientas, y dedica tu tiempo al juicio y a las personas.',
    s: [
      'Números y personas juntos: conviertes el análisis en persuasión y te ganas la confianza de los ejecutivos, sobre todo en las revisiones mensuales y en el presupuesto.',
      'Serenidad bajo presión: sostienes al equipo cuando un cierre sale mal.',
      'Una lente amplia: ofreces varias opciones estratégicas, en lugar de una sola.'
    ],
    g: [
      'Lo haces todo tú: el reporte repetido se come el tiempo que necesitas para las llamadas estratégicas. Decide qué delegar o automatizar.',
      'La perfección te frena: comparte primero un borrador al 80%.'
    ],
    t: [T('Gemini', 'main', 'Borradores del informe mensual de gestión, en automático', 'Conecta Sheets, Docs y Mail para que Gemini redacte el informe mensual de gestión. Tú te concentras en la interpretación y en las decisiones.', 'Usando la hoja de resumen del estado de resultados de este mes, redacta un informe de gestión con los factores de las variaciones y los riesgos del mes siguiente.'),
        T('AlphaSense', 'specialist', 'Una vista del mercado en minutos', 'Revisa de un vistazo las presentaciones y las llamadas de resultados de los competidores, para armar una vista del mercado para la junta.', 'Resume lo que dijeron tres competidores sobre márgenes y planes de inversión en sus últimas llamadas de resultados.'),
        T('Tableau', 'specialist', 'Responde las preguntas de los ejecutivos con números', 'Pon el estado de resultados, el flujo de caja y el presupuesto vs. real en una sola pantalla, para poder responder preguntas en el momento.', 'Sugiere el diseño de un tablero ejecutivo para el estado de resultados, el flujo de caja y el presupuesto vs. real.')],
    syn: 'Un todoterreno más la IA se vuelve un CFO que se expande: Gemini redacta, AlphaSense amplía tu vista y Tableau responde en el momento. El trabajo repetido se va a las herramientas; el juicio se queda contigo.',
    day: '8:30 Lees el borrador del informe mensual que preparó Gemini. 9:30 Revisas el presupuesto vs. real en Tableau. 10:30 Revisas las llamadas de competidores en AlphaSense. 11:30 Reunión con ejecutivos: respondes con números. 14:30 Fijas la dirección de un proyecto estratégico. 16:00 Delegas o automatizas un informe repetido. 17:30 Compartes un borrador al 80% antes de irte.'
  });
})();

