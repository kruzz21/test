export interface Service {
  id: number;
  slug: string;
  imageUrl: string;
  icon: string;
}

export const services = [
  {
    id: 1,
    slug: "arthroscopic-surgery",
    imageUrl: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    icon: "Stethoscope"
  },
  {
    id: 2,
    slug: "joint-replacements",
    imageUrl: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    icon: "Bone"
  },
  {
    id: 3,
    slug: "fracture-trauma-surgery",
    imageUrl: "https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    icon: "PenTool"
  },
  {
    id: 4,
    slug: "pediatric-orthopedics",
    imageUrl: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    icon: "Baby"
  },
  {
    id: 5,
    slug: "sports-injuries-rehab",
    imageUrl: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    icon: "Activity"
  }
];

export const getServiceData = (id: number) => {
  const service = services.find(s => s.id === id);
  
  if (!service) return null;
  
  const serviceDetails: Record<number, any> = {
    1: {
      title: {
        az: "Artroskopik Cərrahiyyə",
        en: "Arthroscopic Surgery",
        tr: "Artroskopik Cerrahi"
      },
      description: {
        az: "Artroskopik cərrahiyyə oynaqların minimal invaziv cərrahiyyəsi üçün qabaqcıl texnikadır.",
        en: "Arthroscopic surgery is an advanced technique for minimally invasive surgery of the joints.",
        tr: "Artroskopik cerrahi, eklemlerin minimal invaziv cerrahisi için gelişmiş bir tekniktir."
      },
      procedures: [
        {
          name: {
            az: "ACL Rekonstruksiyası",
            en: "ACL Reconstruction",
            tr: "ACL Rekonstrüksiyonu"
          },
          description: {
            az: "Ön çarpaz bağın (ACL) yenidən qurulması.",
            en: "Reconstruction of the anterior cruciate ligament (ACL).",
            tr: "Ön çapraz bağın (ACL) yeniden yapılandırılması."
          }
        },
        {
          name: {
            az: "Menisküs Təmiri",
            en: "Meniscus Repair",
            tr: "Menisküs Tamiri"
          },
          description: {
            az: "Diz oynağındakı menisküsün təmiri və ya çıxarılması.",
            en: "Repair or removal of the meniscus in the knee joint.",
            tr: "Diz eklemindeki menisküsün tamiri veya çıkarılması."
          }
        },
        {
          name: {
            az: "Rotator Manşet Təmiri",
            en: "Rotator Cuff Repair",
            tr: "Rotator Manşet Tamiri"
          },
          description: {
            az: "Çiyin oynağındakı rotator manşet zədələrinin təmiri.",
            en: "Repair of rotator cuff tears in the shoulder joint.",
            tr: "Omuz eklemindeki rotator manşet yırtıklarının tamiri."
          }
        },
        {
          name: {
            az: "Çiyin Artroskopiyası",
            en: "Shoulder Arthroscopy",
            tr: "Omuz Artroskopisi"
          },
          description: {
            az: "Çiyin oynağının müayinəsi və müalicəsi üçün artroskopik prosedur.",
            en: "Arthroscopic procedure for examination and treatment of the shoulder joint.",
            tr: "Omuz ekleminin muayenesi ve tedavisi için artroskopik prosedür."
          }
        },
        {
          name: {
            az: "Bankart Təmiri",
            en: "Bankart Repair",
            tr: "Bankart Tamiri"
          },
          description: {
            az: "Çiyin stabilliyini bərpa etmək üçün prosedur.",
            en: "Procedure to restore shoulder stability.",
            tr: "Omuz stabilitesini geri kazandırmak için prosedür."
          }
        }
      ]
    },
    2: {
      title: {
        az: "Oynaq Əvəzlənməsi",
        en: "Joint Replacements",
        tr: "Eklem Replasmanları"
      },
      description: {
        az: "Oynaq əvəzlənməsi zədələnmiş və ya aşınmış oynaqları süni implantlarla əvəz edir, ağrıları azaldır və hərəkətliliyi artırır.",
        en: "Joint replacement replaces damaged or worn joints with artificial implants, reducing pain and improving mobility.",
        tr: "Eklem replasmanı, hasarlı veya aşınmış eklemleri yapay implantlarla değiştirerek ağrıyı azaltır ve hareket kabiliyetini artırır."
      },
      procedures: [
        {
          name: {
            az: "Diz Oynağı Əvəzlənməsi",
            en: "Knee Replacement",
            tr: "Diz Eklemi Replasmanı"
          },
          description: {
            az: "Zədələnmiş diz oynağının süni implantla əvəz edilməsi.",
            en: "Replacement of damaged knee joint with an artificial implant.",
            tr: "Hasarlı diz ekleminin yapay implantla değiştirilmesi."
          }
        },
        {
          name: {
            az: "Bud Oynağı Əvəzlənməsi",
            en: "Hip Replacement",
            tr: "Kalça Eklemi Replasmanı"
          },
          description: {
            az: "Zədələnmiş bud oynağının süni implantla əvəz edilməsi.",
            en: "Replacement of damaged hip joint with an artificial implant.",
            tr: "Hasarlı kalça ekleminin yapay implantla değiştirilmesi."
          }
        },
        {
          name: {
            az: "Çiyin Oynağı Əvəzlənməsi",
            en: "Shoulder Replacement",
            tr: "Omuz Eklemi Replasmanı"
          },
          description: {
            az: "Zədələnmiş çiyin oynağının süni implantla əvəz edilməsi.",
            en: "Replacement of damaged shoulder joint with an artificial implant.",
            tr: "Hasarlı omuz ekleminin yapay implantla değiştirilmesi."
          }
        },
        {
          name: {
            az: "Pediatrik Bud Oynağı",
            en: "Pediatric Hip",
            tr: "Pediatrik Kalça"
          },
          description: {
            az: "Uşaqlarda bud oynağı problemlərinin müalicəsi.",
            en: "Treatment of hip joint problems in children.",
            tr: "Çocuklarda kalça eklemi sorunlarının tedavisi."
          }
        }
      ]
    },
    3: {
      title: {
        az: "Sınıq və Travma Cərrahiyyəsi",
        en: "Fracture & Trauma Surgery",
        tr: "Kırık ve Travma Cerrahisi"
      },
      description: {
        az: "Sınıq və travma cərrahiyyəsi sümük və oynaqların zədələnmələrinin müalicəsi ilə məşğuldur.",
        en: "Fracture and trauma surgery deals with the treatment of injuries to bones and joints.",
        tr: "Kırık ve travma cerrahisi, kemik ve eklemlerdeki yaralanmaların tedavisiyle ilgilenir."
      },
      procedures: [
        {
          name: {
            az: "Dirsək Sınığı",
            en: "Elbow Fracture",
            tr: "Dirsek Kırığı"
          },
          description: {
            az: "Dirsək sümüklərinin sınıqlarının müalicəsi.",
            en: "Treatment of fractures of the elbow bones.",
            tr: "Dirsek kemiklerindeki kırıkların tedavisi."
          }
        },
        {
          name: {
            az: "Topuq Sınığı",
            en: "Ankle Fracture",
            tr: "Ayak Bileği Kırığı"
          },
          description: {
            az: "Topuq sümüklərinin sınıqlarının müalicəsi.",
            en: "Treatment of fractures of the ankle bones.",
            tr: "Ayak bileği kemiklerindeki kırıkların tedavisi."
          }
        },
        {
          name: {
            az: "Bud Sınığı",
            en: "Hip Fracture",
            tr: "Kalça Kırığı"
          },
          description: {
            az: "Bud sümüklərinin sınıqlarının müalicəsi.",
            en: "Treatment of fractures of the hip bones.",
            tr: "Kalça kemiklerindeki kırıkların tedavisi."
          }
        },
        {
          name: {
            az: "Karpal Tunel",
            en: "Carpal Tunnel",
            tr: "Karpal Tünel"
          },
          description: {
            az: "Karpal tunel sindromunu müalicəsi.",
            en: "Treatment of carpal tunnel syndrome.",
            tr: "Karpal tünel sendromunun tedavisi."
          }
        }
      ]
    },
    4: {
      title: {
        az: "Pediatrik Ortopediya",
        en: "Pediatric Orthopedics",
        tr: "Pediatrik Ortopedi"
      },
      description: {
        az: "Pediatrik ortopediya uşaqlarda sümük, oynaq və əzələ problemlərinin diaqnozu və müalicəsidir.",
        en: "Pediatric orthopedics is the diagnosis and treatment of bone, joint, and muscle problems in children.",
        tr: "Pediatrik ortopedi, çocuklarda kemik, eklem ve kas sorunlarının teşhisi ve tedavisidir."
      },
      procedures: [
        {
          name: {
            az: "Çarpayaq",
            en: "Clubfoot",
            tr: "Çarpık Ayak"
          },
          description: {
            az: "Anadangəlmə çarpayaq deformasiyasının müalicəsi.",
            en: "Treatment of congenital clubfoot deformity.",
            tr: "Doğuştan çarpık ayak deformitesinin tedavisi."
          }
        },
        {
          name: {
            az: "Bud Displaziyası",
            en: "Hip Dysplasia",
            tr: "Kalça Displazisi"
          },
          description: {
            az: "Uşaqlarda bud oynağı displaziyasının müalicəsi.",
            en: "Treatment of hip joint dysplasia in children.",
            tr: "Çocuklarda kalça eklemi displazisinin tedavisi."
          }
        },
        {
          name: {
            az: "Deformasiyalar",
            en: "Deformities",
            tr: "Deformiteler"
          },
          description: {
            az: "Uşaqlarda sümük və oynaq deformasiyalarının müalicəsi.",
            en: "Treatment of bone and joint deformities in children.",
            tr: "Çocuklarda kemik ve eklem deformitelerinin tedavisi."
          }
        }
      ]
    },
    5: {
      title: {
        az: "İdman Zədələri və Reabilitasiya",
        en: "Sports Injuries & Rehab",
        tr: "Spor Yaralanmaları ve Rehabilitasyon"
      },
      description: {
        az: "İdman zədələri və reabilitasiya idman fəaliyyəti nəticəsində yaranan zədələrin müalicəsi və reabilitasiyasıdır.",
        en: "Sports injuries and rehabilitation is the treatment and rehabilitation of injuries resulting from sports activities.",
        tr: "Spor yaralanmaları ve rehabilitasyon, spor faaliyetlerinden kaynaklanan yaralanmaların tedavisi ve rehabilitasyonudur."
      },
      procedures: [
        {
          name: {
            az: "Əzələ/Bağ Zədələri",
            en: "Muscle/Ligament Damage",
            tr: "Kas/Bağ Hasarı"
          },
          description: {
            az: "Əzələ və bağ zədələrinin müalicəsi.",
            en: "Treatment of muscle and ligament injuries.",
            tr: "Kas ve bağ yaralanmalarının tedavisi."
          }
        },
        {
          name: {
            az: "Bərpa Proqramları",
            en: "Recovery Programs",
            tr: "İyileşme Programları"
          },
          description: {
            az: "İdman zədələrindən sonra bərpa proqramları.",
            en: "Recovery programs after sports injuries.",
            tr: "Spor yaralanmalarından sonra iyileşme programları."
          }
        }
      ]
    }
  };
  
  return {
    ...service,
    ...serviceDetails[id]
  };
};