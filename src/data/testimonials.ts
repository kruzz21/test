export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  content: {
    az: string;
    en: string;
    tr: string;
  };
  date: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aynur Mammadova",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 5,
    content: {
      az: "Dr. Eryanılmaz mənim diz əməliyyatımdan sonra həyatımı dəyişdi. Onun peşəkar yanaşması və qayğısı sağalmamı daha da asanlaşdırdı. İndi ağrısız gəzə bilirəm və həyatımdan həzz alıram.",
      en: "Dr. Eryanılmaz changed my life after my knee surgery. His professional approach and care made my recovery even easier. I can now walk without pain and enjoy my life.",
      tr: "Dr. Eryanılmaz, diz ameliyatımdan sonra hayatımı değiştirdi. Profesyonel yaklaşımı ve özeni iyileşmemi daha da kolaylaştırdı. Artık ağrısız yürüyebiliyor ve hayatımın tadını çıkarabiliyorum."
    },
    date: "2024-03-15"
  },
  {
    id: 2,
    name: "Ilgar Aliyev",
    avatar: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 5,
    content: {
      az: "Futbol zamanı ciddi diz zədəsi aldım. Dr. Eryanılmaz mənim ACL-imi yenidən qurdu və inanılmaz bir reabilitasiya planı tərtib etdi. 6 ay sonra mən yenidən meydana qayıtdım!",
      en: "I suffered a severe knee injury during football. Dr. Eryanılmaz reconstructed my ACL and created an incredible rehabilitation plan. After 6 months, I returned to the field!",
      tr: "Futbol sırasında ciddi bir diz yaralanması yaşadım. Dr. Eryanılmaz ACL'mi yeniden yapılandırdı ve inanılmaz bir rehabilitasyon planı oluşturdu. 6 ay sonra sahaya geri döndüm!"
    },
    date: "2023-11-20"
  },
  {
    id: 3,
    name: "Leyla Hajiyeva",
    avatar: "https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 5,
    content: {
      az: "İllərdir bud ağrılarından əziyyət çəkirdim və nəhayət Dr. Eryanılmazın yanına getdim. O, bud əvəzlənməsi üçün ən yaxşı seçim olduğuna qərar verdi və əməliyyat tamamilə uğurla keçdi. Onun bacarığı və dəstəyi üçün çox minnətdaram.",
      en: "I had been suffering from hip pain for years and finally went to Dr. Eryanılmaz. He decided that hip replacement was the best option and the surgery was completely successful. I am very grateful for his skill and support.",
      tr: "Yıllardır kalça ağrısı çekiyordum ve sonunda Dr. Eryanılmaz'a gittim. Kalça replasmanının en iyi seçenek olduğuna karar verdi ve ameliyat tamamen başarılı oldu. Becerisi ve desteği için çok minnettarım."
    },
    date: "2024-01-08"
  },
  {
    id: 4,
    name: "Tural Mammadov",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 5,
    content: {
      az: "Oğlumun anadangəlmə ayaq deformasiyası var idi və biz çox narahat idik. Dr. Eryanılmaz bizi sakitləşdirdi və müalicəni izah etdi. Onun müalicəsindən bir neçə ay sonra oğlumun ayağı normal görünür və o, indi digər uşaqlar kimi qaça bilir!",
      en: "My son had a congenital foot deformity and we were very worried. Dr. Eryanılmaz calmed us down and explained the treatment. A few months after his treatment, my son's foot looks normal and he can now run like other kids!",
      tr: "Oğlumun doğuştan bir ayak deformitesi vardı ve çok endişeliydik. Dr. Eryanılmaz bizi sakinleştirdi ve tedaviyi açıkladı. Tedavisinden birkaç ay sonra oğlumun ayağı normal görünüyor ve artık diğer çocuklar gibi koşabiliyor!"
    },
    date: "2023-09-05"
  },
  {
    id: 5,
    name: "Nigar Rzayeva",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 5,
    content: {
      az: "Tenisçi dirsəyi məni aylarla narahat edirdi. Dr. Eryanılmazın müalicəsi ilə, fiziki terapiya və ağrı idarəetmə metodları da daxil olmaqla, artıq ağrısız tennis oynaya bilirəm. Onun hərtərəfli yanaşmasını çox qiymətləndirirəm.",
      en: "Tennis elbow had been bothering me for months. With Dr. Eryanılmaz's treatment, including physical therapy and pain management methods, I can now play tennis without pain. I really appreciate his comprehensive approach.",
      tr: "Tenisçi dirseği beni aylardır rahatsız ediyordu. Dr. Eryanılmaz'ın fizik tedavi ve ağrı yönetimi yöntemlerini içeren tedavisiyle, artık ağrısız tenis oynayabiliyorum. Kapsamlı yaklaşımını gerçekten takdir ediyorum."
    },
    date: "2024-02-22"
  }
];