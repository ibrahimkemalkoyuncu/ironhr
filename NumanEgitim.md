# 👔 Numan Bey – İnsan Kaynakları Alan Uzmanı Eğitim Dosyası

Bu dosya, **IRONHR** sisteminin işleyiş mantığını ve modüllerin kurumsal dünyadaki önemini anlatmak için Kemal Bey'in talebiyle oluşturulmuştur.

---

## 🚀 1. Yol Haritası (Roadmap)

IRONHR, bir personelin işe alımından emekliliğine kadar olan tüm süreci (Employee Lifecycle) dijitalleştirir.

1.  **Organizasyonel Yapı (Şirket/Şube/Departman):** Gemi limandan çıkmadan önce rotanın belirlendiği aşamadır. Şirket olmadan personel, personel olmadan bordro olmaz. **(Şu an buradayız)**
2.  **Özlük Yönetimi:** Personel kartları, kimlik bilgileri, döküman yönetimi.
3.  **İzin ve Zaman Yönetimi:** Kanuni ve idari izinler, vardiyalar, PDKS entegrasyonu.
4.  **Bordro ve Tahakkuk:** Maaş hesaplamaları, SGK bildirimleri, yan haklar.
5.  **Performans ve Yetkinlik:** 360 derece değerlendirmeler, hedef takibi.

---

## 🏢 2. Modül: Organizasyon Yönetimi (Şirket Tanımı)

### Neden Önemli?

Bir holding bünyesinde 10 farklı şirket olabilir. Her şirketin Vergi Numarası, Mersis No ve bağlı olduğu Sosyal Güvenlik Merkezi farklıdır.

### Kritik Domain Kuralları:

- **Vergi Numarası:** Türkiye Cumhuriyeti yasalarına göre her şirket için tektir. Sistemde mükerrer (duplicate) olamaz.
- **Hiyerarşi:** Şirket -> Şube -> Departman -> Birim -> Pozisyon şeklinde aşağı doğru akar. Bu hiyerarşi, yetki matrisinin (kim kimi görür, kimin iznini kim onaylar) temelidir.

### Numan Bey'in Notu:

_"Gerçek hayatta bir personelin departmanı değiştiğinde, eski departmanındaki geçmişi silinmez; tarihçeli saklanır. Bu yüzden sistemde 'Soft Delete' ve 'Versioning' (Versiyonlama) kritik öneme sahiptir."_

---

## 🎯 Şu Anki Hedef

Şu an **Şirket Oluşturma** (Create Company) özelliğini tamamladık. Bu, sistemin temel direğidir. Buradan sonra bu şirkete bağlı şubeleri tanımlayarak personellerimiz için yuva hazırlayacağız.
