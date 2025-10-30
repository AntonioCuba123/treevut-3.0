import React from 'react';
import { BanknotesIcon, BookOpenIcon, CheckBadgeIcon, LightBulbIcon, DocumentTextIcon, CameraIcon } from './Icons';

const articles = [
    {
        title: "¿Qué es la Devolución de Impuestos?",
        icon: BanknotesIcon,
        color: 'text-primary',
        content: (
            <div className="prose">
                <p>
                    Es un beneficio que te permite recuperar una parte del <strong>Impuesto a la Renta</strong> que pagaste durante el año. En Perú, puedes deducir gastos adicionales hasta por un monto de <strong>3 UIT</strong> (Unidad Impositiva Tributaria).
                </p>
                <ul>
                    <li><strong>¿Cómo funciona?</strong> Al realizar consumos en rubros específicos (como restaurantes, hoteles, servicios profesionales) y solicitar un comprobante electrónico (boleta o recibo por honorarios) con tu DNI, un porcentaje de ese gasto se suma a tu favor.</li>
                    <li><strong>El objetivo de treev<span className="text-danger">ü</span>t</strong> es ayudarte a maximizar esa acumulación registrando todos tus gastos formales para que no dejes dinero en la mesa.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Gastos Deducibles Clave (La Regla del 3%)",
        icon: BookOpenIcon,
        color: 'text-blue-400',
        content: (
             <div className="prose">
                <p>
                    ¡Buenas noticias: la regla es simple! Por cada consumo en las categorías clave, puedes deducir el <strong>3% del valor total</strong> de tu comprobante. Este monto se suma a tu "billetera" de gastos deducibles hasta el tope de 3 UIT anuales.
                </p>
                <p>Las categorías más importantes son:</p>
                <ul>
                    <li><strong>Restaurantes y Bares:</strong> Cualquier consumo en estos establecimientos.</li>
                    <li><strong>Hoteles y Servicios Turísticos:</strong> Alojamiento y paquetes turísticos.</li>
                    <li><strong>Servicios Profesionales:</strong> Si contratas a un abogado, dentista, o cualquier profesional que emita Recibo por Honorarios Electrónico.</li>
                    <li><strong>Alquiler de Inmuebles:</strong> El pago mensual de tu vivienda o local.</li>
                    <li><strong>Aportaciones a EsSalud por trabajadoras del hogar.</strong></li>
                </ul>
                <p><strong>Recuerda:</strong> Para que el gasto sea válido, siempre debes solicitar que incluyan tu DNI en el comprobante electrónico.</p>
            </div>
        )
    },
    {
        title: "El Poder de la Boleta Electrónica",
        icon: CheckBadgeIcon,
        color: 'text-yellow-400',
        content: (
            <div className="prose">
                <p>
                    La boleta de venta electrónica es tu mejor aliada. A diferencia de un ticket simple o un recibo manual, este documento digital es la <strong>prueba oficial</strong> ante la SUNAT de que tu consumo es formal y, por lo tanto, válido para la deducción de impuestos.
                </p>
                <p>
                    Cuando pides una boleta electrónica, estás contribuyendo a:
                </p>
                 <ul>
                    <li><strong>Combatir la evasión fiscal:</strong> Aseguras que el negocio pague los impuestos que le corresponden.</li>
                    <li><strong>Fortalecer tu "salud financiera":</strong> Cada boleta es como una semilla que siembras para tu futura devolución.</li>
                    <li><strong>Simplificar tu vida:</strong> Los comprobantes electrónicos se registran automáticamente en el sistema de SUNAT, facilitando tu declaración anual.</li>
                </ul>
            </div>
        )

    },
    {
        title: "Tutorial de Video: Cómo registrar tus gastos con treevüt",
        icon: CameraIcon,
        color: 'text-pink-400',
        content: (
            <div className="prose">
                <p>
                    ¡Registrar tus gastos nunca fue tan fácil! Nuestra IA de Gemini hace el trabajo pesado por ti. Mira este video y lee la guía para convertirte en un experto registrando tus comprobantes.
                </p>
                {/* Simulated Video Player */}
                <div className="relative aspect-video bg-background rounded-xl overflow-hidden my-4 flex items-center justify-center border border-active-surface/50">
                    <img src="https://storage.googleapis.com/aistudio-bucket/previews/23114144-5145-4876-a0f5-54f73868840d/S128_23114144-5145-4876-a0f5-54f73868840d.jpeg" alt="Video thumbnail for expense registration tutorial" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative text-center text-on-surface">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <p className="font-bold mt-2">Ver Tutorial</p>
                    </div>
                </div>
                <strong>Paso a Paso:</strong>
                <ul>
                    <li><strong>1. Inicia el Registro:</strong> Toca el botón verde (+) en la esquina inferior y elige "Foto de Recibo" para usar tu cámara o "Subir Recibo" para seleccionar un archivo (imagen o PDF).</li>
                    <li><strong>2. Captura o Sube:</strong> Si usas la cámara, asegúrate de que la foto sea nítida y bien iluminada. Si subes un archivo, simplemente selecciónalo desde tu dispositivo.</li>
                    <li><strong>3. La Magia de la IA:</strong> ¡Espera un momento! Gemini analizará la imagen o el documento y extraerá automáticamente la Razón Social, RUC, fecha y total.</li>
                    <li><strong>4. Revisa y Guarda:</strong> La app te mostrará los datos extraídos. ¡Revísalos! Si todo está correcto, pulsa "Guardar". Si necesitas ajustar algo, puedes editar cualquier campo antes de guardar.</li>
                </ul>
                <strong>Consejos para un Registro Exitoso:</strong>
                 <ul>
                    <li><strong>Usa comprobantes electrónicos:</strong> Las boletas y facturas electrónicas son las que mejor lee la IA y las únicas válidas para la deducción.</li>
                    <li><strong>Calidad sobre cantidad:</strong> Una foto clara y sin sombras es mejor que diez borrosas. Evita arrugas en el papel.</li>
                    <li><strong>Confía, pero verifica:</strong> La IA es increíblemente precisa, pero un doble chequeo rápido asegura que tus datos sean perfectos.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Tips para un Presupuesto Inteligente",
        icon: LightBulbIcon,
        color: 'text-orange-400',
        content: (
            <div className="prose">
                <p>
                   Un presupuesto es la herramienta más poderosa para tomar el control de tu dinero. La <strong>regla 50/30/20</strong> es un método simple y efectivo para empezar:
                </p>
                <ul>
                    <li><strong>50% para Necesidades:</strong> Gastos fijos e indispensables como vivienda, servicios básicos, alimentación y transporte.</li>
                    <li><strong>30% para Deseos:</strong> Gastos variables que mejoran tu calidad de vida, como salidas, hobbies, suscripciones o compras no esenciales.</li>
                    <li><strong>20% para Ahorro e Inversión:</strong> Destina esta parte a tus metas a largo plazo, como un fondo de emergencia, pagar deudas o invertir para tu futuro.</li>
                </ul>
                 <p>Usa treev<span className="text-danger">ü</span>t para registrar todo y verás al instante cómo se distribuyen tus gastos según esta regla.</p>
            </div>
        )
    },
    {
        title: "Beneficios de los Recibos Electrónicos",
        icon: DocumentTextIcon,
        color: 'text-blue-400',
         content: (
            <div className="prose">
                <p>
                   Ya sea que emitas o recibas un comprobante, la versión electrónica ofrece enormes ventajas sobre el papel:
                </p>
                <ul>
                    <li><strong>Seguridad y Validez:</strong> Tienen la misma validez legal que un comprobante físico, pero con la seguridad de estar registrados en SUNAT.</li>
                    <li><strong>Ahorro y Ecología:</strong> Reduces costos de impresión, almacenamiento y envío, además de contribuir con el medio ambiente.</li>
                    <li><strong>Accesibilidad:</strong> Puedes consultarlos, descargarlos o enviarlos por correo en cualquier momento desde el portal de SUNAT.</li>
                    <li><strong>Integración:</strong> Facilitan la contabilidad y la gestión administrativa, reduciendo errores manuales.</li>
                </ul>
                 <p>¡La formalidad digital es el camino hacia finanzas más sanas y un país más transparente!</p>
            </div>
        )
    },
];

const ArticleCard = ({ article }: { article: typeof articles[0] }) => {
    const Icon = article.icon;
    return (
        <div className="bg-surface rounded-2xl border border-active-surface/50 overflow-hidden">
            <div className="w-full p-4 flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-active-surface flex-shrink-0">
                    <Icon className={`w-7 h-7 ${article.color}`} />
                </div>
                <div className="min-w-0 overflow-hidden">
                    <h3 className="font-bold text-on-surface break-words">{article.title}</h3>
                </div>
            </div>
            <div className="px-4 pt-0 pb-4">
                {article.content}
            </div>
        </div>
    )
}

const LearnView: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="bg-surface rounded-2xl p-4 border border-active-surface/50">
                 <h2 className="text-xl font-bold text-on-surface mb-2">Centro de Aprendizaje</h2>
                 <p className="text-sm text-on-surface-secondary">Potencia tus finanzas con conocimiento. Aquí encontrarás guías y tips para tomar el control de tu dinero y aprovechar los beneficios fiscales en Perú.</p>
            </div>
            <div className="space-y-4">
                {articles.map((article, index) => (
                    <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                         <ArticleCard 
                            article={article} 
                         />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(LearnView);