import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Users, Calendar, Stethoscope, GraduationCap, MapPin, Languages } from 'lucide-react';

const IntroSection = () => {
  const { t } = useTranslation();

  const credentials = [
    {
      icon: GraduationCap,
      title: "Education",
      description: "Ege University Faculty of Medicine (1987-1993)"
    },
    {
      icon: Stethoscope,
      title: "Specialization",
      description: "İzmir Tepecik Hospital (1998)"
    },
    {
      icon: MapPin,
      title: "Current Position",
      description: "Senior Orthopedic Surgeon, Medera Hospital, Baku"
    },
    {
      icon: Languages,
      title: "Languages",
      description: "Turkish, English, Azerbaijani"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Dr. Eryanılmaz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A distinguished orthopedic surgeon with over two decades of experience in 
              complex joint replacements, arthroscopic procedures, and trauma surgery.
            </p>
          </motion.div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {credentials.map((credential, index) => (
              <motion.div
                key={index}
                className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <credential.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{credential.title}</h3>
                    <p className="text-gray-700 text-sm">{credential.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Practice Locations */}
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Practice Locations</h3>
              <p className="text-blue-100">Currently serving patients in Baku with regional clinics in Balakən and Lankaran</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-1">Main Location</h4>
                <p className="text-blue-100 text-sm">Medera Hospital, Baku</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-1">Office Hours</h4>
                <p className="text-blue-100 text-sm">Mon-Fri: 9:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 2:00 PM</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-1">Emergency Care</h4>
                <p className="text-blue-100 text-sm">24/7 Emergency Services Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;