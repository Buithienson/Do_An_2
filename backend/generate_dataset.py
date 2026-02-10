import json
import random
import os

destinations = [
    {
        "id": "hanoi", "name": "Hà Nội", "lat": 21.0285, "lon": 105.8542,
        "desc": "Thủ đô ngàn năm văn hiến với khu phố cổ nhộn nhịp, hồ Hoàn Kiếm thơ mộng và ẩm thực đường phố phong phú.",
        "hotels": [
            ("Sofitel Legend Metropole Hanoi", "15 Ngo Quyen, Hoan Kiem", 5, 5000000, ["Spa", "Pool", "Gym", "Fine Dining", "Historic"]),
            ("Lotte Hotel Hanoi", "54 Lieu Giai, Ba Dinh", 5, 3500000, ["Sky Bar", "Indoor Pool", "Gym", "Panorama View"]),
            ("La Siesta Premium Hang Be", "27 Hang Be, Hoan Kiem", 4, 1800000, ["Rooftop Bar", "Spa", "Central Location"]),
            ("The Oriental Jade Hotel", "92-94 Hang Trong, Hoan Kiem", 4, 2200000, ["Pool", "Spa", "Restaurant"]),
            ("Hanoi Daewoo Hotel", "360 Kim Ma, Ba Dinh", 5, 2800000, ["Large Pool", "Garden", "Gym", "Business Center"]),
            ("Apricot Hotel", "136 Hang Trong, Hoan Kiem", 5, 4000000, ["Lake View", "Rooftop Pool", "Art Gallery", "Gym"]),
            ("Melia Hanoi", "44B Ly Thuong Kiet, Hoan Kiem", 5, 3000000, ["Conference Center", "Pool", "Gym", "Executive Lounge"])
        ]
    },
    {
        "id": "hcm", "name": "TP. Hồ Chí Minh", "lat": 10.8231, "lon": 106.6297,
        "desc": "Thành phố sôi động nhất Việt Nam, trung tâm kinh tế, văn hóa với những tòa nhà chọc trời và di tích lịch sử.",
        "hotels": [
            ("The Reverie Saigon", "22-36 Nguyen Hue, District 1", 5, 6000000, ["Luxury Spa", "Pool", "Italian Design", "Butler Service"]),
            ("Park Hyatt Saigon", "2 Lam Son Square, District 1", 5, 7500000, ["French Colonial", "Pool", "Garden", "Spa"]),
            ("Caravelle Saigon", "19-23 Lam Son Square, District 1", 5, 4000000, ["Rooftop Bar", "Pool", "Gym", "Heritage"]),
            ("Hotel Majestic Saigon", "1 Dong Khoi, District 1", 5, 3500000, ["River View", "Historic", "Pool", "Casino"]),
            ("Liberty Central Saigon Citypoint", "59-61 Pasteur, District 1", 4, 2500000, ["Cinema", "Rooftop Pool", "Gym", "Modern"]),
            ("Pullman Saigon Centre", "148 Tran Hung Dao, District 1", 5, 3200000, ["Rooftop Bar", "Pool", "Fit Lounge", "Meeting Rooms"]),
            ("New World Saigon Hotel", "76 Le Lai, District 1", 5, 3800000, ["Large Pool", "Garden", "Gym", "Central Loc"])
        ]
    },
    {
        "id": "danang", "name": "Đà Nẵng", "lat": 16.0544, "lon": 108.2022,
        "desc": "Thành phố đáng sống với bờ biển dài tuyệt đẹp, cầu Rồng độc đáo và nằm gần các di sản văn hóa.",
        "hotels": [
            ("InterContinental Danang Sun Peninsula Resort", "Son Tra Peninsula", 5, 12000000, ["Private Beach", "Luxury Spa", "Michelin Dining", "Nature"]),
            ("Furama Resort Danang", "105 Vo Nguyen Giap, Ngu Hanh Son", 5, 4500000, ["Lagoon Pool", "Beachfront", "Spa", "Casino"]),
            ("Novotel Danang Premier Han River", "36 Bach Dang, Hai Chau", 5, 2800000, ["River View", "Sky Bar", "Pool", "Yoga"]),
            ("A La Carte Danang Beach", "200 Vo Nguyen Giap, Son Tra", 4, 1800000, ["Infinity Pool", "Ocean View", "Kitchenette", "Spa"]),
            ("Sala Danang Beach Hotel", "36-38 Lam Hoanh, Son Tra", 4, 1500000, ["Pool", "Gym", "Near Beach", "Free Breakfast"]),
            ("Hyatt Regency Danang Resort and Spa", "5 Truong Sa, Ngu Hanh Son", 5, 5500000, ["Beachfront", "Multiple Pools", "Kid Club", "Spa"]),
            ("Haian Beach Hotel & Spa", "278 Vo Nguyen Giap, Ngu Hanh Son", 4, 1600000, ["Infinity Pool", "Sea View", "Afternoon Tea"])
        ]
    },
    {
        "id": "hoian", "name": "Hội An", "lat": 15.8801, "lon": 108.3380,
        "desc": "Phố cổ yên bình với những ngôi nhà vàng cổ kính, đèn lồng rực rỡ và ẩm thực đặc sắc.",
        "hotels": [
            ("Four Seasons Resort The Nam Hai", "Ha My Beach, Dien Ban", 5, 15000000, ["Private Villa", "Beachfront", "Luxury Spa", "Cooking Class"]),
            ("Anantara Hoi An Resort", "1 Pham Hong Thai", 5, 4000000, ["River View", "Colonial Style", "Pool", "Spa"]),
            ("La Siesta Hoi An Resort & Spa", "132 Hung Vuong", 5, 2500000, ["Saltwater Pool", "Rice Field View", "Spa", "Shuttle Bus"]),
            ("Little Riverside Hoi An", "09 Phan Boi Chau", 5, 2200000, ["River View", "Rooftop Pool", "Spa", "Bicycles"]),
            ("Allegro Hoi An", "86 Tran Hung Dao", 5, 2000000, ["Near Old Town", "Pool", "Gym", "Spa"]),
            ("Hoi An Central Boutique Hotel", "91 Hung Vuong", 4, 1500000, ["Private Beach Area", "Pool", "Central", "Bar"]),
            ("Silk Sense Hoi An River Resort", "Tan Thinh, Cam An", 5, 2800000, ["River Garden", "Pool", "E-Car", "Organic Garden"])
        ]
    },
    {
        "id": "nhatrang", "name": "Nha Trang", "lat": 12.2388, "lon": 109.1967,
        "desc": "Thiên đường biển đảo với vịnh biển đẹp nhất thế giới, hải sản tươi ngon và VinWonders sôi động.",
        "hotels": [
            ("Six Senses Ninh Van Bay", "Ninh Van Bay", 5, 18000000, ["Private Villa", "Secluded", "Spa", "Water Sports"]),
            ("InterContinental Nha Trang", "32-34 Tran Phu", 5, 3500000, ["Ocean View", "Pool", "Club Lounge", "Beachfront"]),
            ("Vinpearl Resort Nha Trang", "Hon Tre Island", 5, 3000000, ["Amusement Park", "Cable Car", "Huge Pool", "Beach"]),
            ("Amiana Resort Nha Trang", "Turtle Bay", 5, 4500000, ["Mud Bath", "Seawater Pool", "Private Beach", "Snorkeling"]),
            ("Sheraton Nha Trang", "26-28 Tran Phu", 5, 3200000, ["Ocean View", "Cooking School", "Infinity Pool", "Shine Spa"]),
            ("Sunrise Nha Trang Beach Hotel & Spa", "12-14 Tran Phu", 5, 2000000, ["Colonial Style", "Pool", "Sky Lounge", "Beach"]),
            ("Mia Resort Nha Trang", "Bai Dong, Cam Lam", 5, 4200000, ["Cliffside", "Private Beach", "Yoga", "Relaxing"])
        ]
    },
    {
        "id": "phuquoc", "name": "Phú Quốc", "lat": 10.2899, "lon": 103.9840,
        "desc": "Đảo Ngọc với những bãi biển hoang sơ, rừng nguyên sinh và hoàng hôn tuyệt đẹp.",
        "hotels": [
            ("JW Marriott Phu Quoc Emerald Bay", "Khem Beach, An Thoi", 5, 8000000, ["Concept Design", "Private Beach", "University Theme", "Luxury"]),
            ("Salinda Resort Phu Quoc Island", "Cua Lap, Duong To", 5, 3500000, ["Sunset View", "Salt Filtration Pool", "Gardens", "Boutique"]),
            ("InterContinental Phu Quoc Long Beach Resort", "Bai Truong, Duong To", 5, 4500000, ["Sky Bar", "Family Friendly", "Beachfront", "Spa"]),
            ("Vinpearl Resort & Spa Phu Quoc", "Bai Dai, Ganh Dau", 5, 2800000, ["Safari", "Grand World", "Huge Pool", "Beach"]),
            ("Premier Village Phu Quoc Resort", "Ong Doi Cape, An Thoi", 5, 6000000, ["Two Coastlines", "Private Pool Villa", "Secluded", "Spa"]),
            ("Fusion Resort Phu Quoc", "Vung Bau Beach", 5, 5500000, ["All-Spa Inclusive", "River Pool", "Beachfront", "Wellness"]),
            ("Lahana Resort Phu Quoc", "91/3 Tran Hung Dao", 4, 1800000, ["Eco Friendly", "Hilltop View", "Infinity Pool", "Nature"])
        ]
    },
    {
        "id": "dalat", "name": "Đà Lạt", "lat": 11.9404, "lon": 108.4583,
        "desc": "Thành phố sương mù lãng mạn, khí hậu mát mẻ quanh năm và ngàn hoa khoe sắc.",
        "hotels": [
            ("Dalat Palace Heritage Hotel", "2 Tran Phu", 5, 4000000, ["Colonial", "Lake View", "Golf", "Historic"]),
            ("Ana Mandara Villas Dalat", "Le Lai", 5, 3500000, ["French Villa", "Pine Forest", "Pool", "Spa"]),
            ("Terracotta Hotel & Resort Dalat", "Tuyen Lam Lake", 4, 1800000, ["Lake View", "Gardens", "Indoor Pool", "Quiet"]),
            ("Swiss-Belresort Tuyen Lam", "Phan Rang Area", 5, 2200000, ["Mountain View", "Golf Course", "Large Pool", "Modern"]),
            ("Colline Hotel", "10 Phan Boi Chau", 4, 1500000, ["Market View", "Modern Design", "Central", "Food Court"]),
            ("Du Parc Hotel Dalat", "15 Tran Phu", 4, 1200000, ["Heritage", "City Center", "Bar", "Classic"]),
            ("Mercure Dalat Resort", "3 Nguyen Du", 4, 2500000, ["French Style", "Garden", "Tennis", "Train Station View"])
        ]
    },
    {
        "id": "halong", "name": "Hạ Long", "lat": 20.9069, "lon": 107.0734,
        "desc": "Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi hùng vĩ trên mặt biển xanh biếc.",
        "hotels": [
            ("Vinpearl Resort & Spa Ha Long", "Reu Island", 5, 3000000, ["Private Island", "360 Ocean View", "Huge Pool", "Spa"]),
            ("Wyndham Legend Halong", "12 Ha Long", 5, 2000000, ["Bay View", "Pool", "Close to Sun World", "Gym"]),
            ("Muong Thanh Luxury Quang Ninh", "Ha Long Road", 5, 1500000, ["City View", "Large Capacity", "Pool", "Karaoke"]),
            ("FLC Halong Bay Golf Club & Luxury Resort", "Nguyen Van Cu", 5, 2800000, ["Golf Course", "Hilltop View", "Infinity Pool", "Grand"]),
            ("Paradise Suites Hotel", "Tuan Chau Island", 4, 1800000, ["Boutique", "Near Harbor", "Spa", "Beach Access"]),
            ("Novotel Ha Long Bay", "160 Ha Long", 4, 1600000, ["Bay View", "Pool", "Terrace", "Modern"]),
            ("D'Lioro Hotel & Resort", "Bai Chay", 5, 2100000, ["Hillside", "View Bay", "Two Pools", "Buffet"])
        ]
    },
    {
        "id": "sapa", "name": "Sapa", "lat": 22.3364, "lon": 103.8438,
        "desc": "Thị trấn trong mây với ruộng bậc thang kỳ vĩ, đỉnh Fansipan và văn hóa bản địa độc đáo.",
        "hotels": [
            ("Hotel de la Coupole - MGallery", "1 Hoang Lien", 5, 4500000, ["Indochine Style", "Indoor Pool", "Sky Bar", "Mall Link"]),
            ("Topas Ecolodge", "Thanh Kim", 4, 5500000, ["Infinity Pool", "Mountain View", "Eco", "Remote"]),
            ("Silk Path Grand Resort & Spa Sapa", "Doi Quan 6", 5, 2500000, ["Rose Garden", "Indoor Pool", "Spa", "Mountain View"]),
            ("Pao's Sapa Leisure Hotel", "Muong Hoa", 5, 2000000, ["Valley View", "Rooftop Bar", "Pool", "Modern"]),
            ("Victoria Sapa Resort & Spa", "Xuan Vien", 4, 2200000, ["Traditional", "Indoor Pool", "Tennis", "Train Ticket"]),
            ("Sapa Horizon Hotel", "18 Pham Xuan Huan", 4, 1500000, ["City Center", "Mountain View", "Friendly", "Breakfast"]),
            ("KK Sapa Hotel", "28A Muong Hoa", 5, 1800000, ["View Fansipan", "Pool", "Lounge", "Spa"])
        ]
    },
    {
        "id": "hue", "name": "Huế", "lat": 16.4637, "lon": 107.5909,
        "desc": "Cố đô trầm mặc với Đại Nội, lăng tẩm vua chúa và dòng sông Hương thơ mộng.",
        "hotels": [
            ("Azerai La Residence Hue", "5 Le Loi", 5, 4500000, ["Art Deco", "River View", "Saltwater Pool", "Spa"]),
            ("Silk Path Grand Hue Hotel", "2 Le Loi", 5, 2000000, ["Royal Style", "Central", "Pool", "Spa"]),
            ("Indochine Palace", "105A Hung Vuong", 5, 1800000, ["Palatial", "Large Pool", "Garden", "Convention"]),
            ("Pilgrimage Village Boutique Resort", "130 Minh Mang", 5, 2200000, ["Rustic", "Wellness", "Quiet", "Shuttle"]),
            ("Alba Wellness Resort By Fusion", "Phong Dien", 5, 3500000, ["Onsen", "Hot Spring", "Wellness", "Forest"]),
            ("Senna Hue Hotel", "7 Nguyen Tri Phuong", 5, 1700000, ["French Style", "Fish Pond", "Central", "Pool"]),
            ("Melia Vinpearl Hue", "50A Hung Vuong", 5, 2000000, ["Skyscraper", "City View", "Pool", "Modern"])
        ]
    },
    {
        "id": "vungtau", "name": "Vũng Tàu", "lat": 10.3460, "lon": 107.0843,
        "desc": "Thành phố biển gần Sài Gòn, nổi tiếng với bãi Sau, tượng chúa Kitô và hải sản.",
        "hotels": [
             ("The Imperial Hotel Vung Tau", "159 Thuy Van", 5, 2500000, ["Private Beach Club", "Victorian", "Pools", "Gym"]),
             ("Pullman Vung Tau", "15 Thi Sach", 5, 2200000, ["Convention", "Pool", "Bar", "Near Lotte Mart"]),
             ("Fusion Suites Vung Tau", "2 Truong Cong Dinh", 4, 2000000, ["Infinity Pools", "Slide", "City View", "Modern"]),
             ("Malibu Hotel", "263 Le Hong Phong", 4, 1500000, ["Infinity Pool", "Buffet", "Gym", "Lounge"]),
             ("Vias Hotel Vung Tau", "179 Thuy Van", 4, 1600000, ["Ocean View", "Infinity Pool", "Restaurant", "Bar"]),
             ("Mercure Vung Tau", "03 Ha Long", 4, 1800000, ["Private Beach", "Sunset View", "Pool", "Resort Style"]),
             ("Marina Bay Vung Tau Resort & Spa", "115 Tran Phu", 5, 2800000, ["Bay View", "Infinity Pool", "Quiet", "Seafood"])
        ]
    },
    {
        "id": "phanthiet", "name": "Phan Thiết", "lat": 10.9289, "lon": 108.1021,
        "desc": "Thủ phủ resort với những đồi cát bay, làng chài Mũi Né và bãi biển xanh ngắt.",
        "hotels": [
            ("Centara Mirage Resort Mui Ne", "Huynh Thuc Khang", 5, 2500000, ["Water Park", "Family", "Spanish Style", "Pools"]),
            ("The Anam Mui Ne", "18 Nguyen Dinh Chieu", 5, 3800000, ["Luxury", "Garden", "Beachfront", "Indochine"]),
            ("Anantara Mui Ne Resort", "12A Nguyen Dinh Chieu", 5, 4200000, ["Villas", "Pool", "Garden", "Spa"]),
            ("Pandanus Resort", "Mui Ne", 4, 1600000, ["Large Garden", "Live Music", "Beachfront", "All Inclusive Option"]),
            ("Sailing Club Resort Mui Ne", "24 Nguyen Dinh Chieu", 4, 2200000, ["Boutique", "Design", "Pool", "Restaurant"]),
            ("Bamboo Village Beach Resort & Spa", "38 Nguyen Dinh Chieu", 4, 1800000, ["Green", "Bamboo Theme", "Spa", "Beach"]),
            ("Sea Links Beach Resort & Golf", "Km9 Nguyen Thong", 5, 2000000, ["Golf Course", "Large Rooms", "Pools", "Apartment Option"])
        ]
    },
    {
        "id": "quynhon", "name": "Quy Nhơn", "lat": 13.7820, "lon": 109.2192,
        "desc": "Thành phố biển hoang sơ với Kỳ Co, Eo Gió và đặc sản xứ Nẫu dân dã.",
        "hotels": [
            ("FLC Luxury Hotel Quy Nhon", "Nhon Ly", 5, 2500000, ["Safari", "Golf", "Huge Pool", "Beachfront"]),
            ("Avani Quy Nhon Resort", "Bai Dai", 5, 3000000, ["Private Beach", "Secluded", "Spa", "Island Trips"]),
            ("Anantara Quy Nhon Villas", "Bai Dai", 5, 8000000, ["Private Villa", "Luxury", "Butler", "Ocean View"]),
            ("Seaside Boutique Resort Quy Nhon", "1D National Road", 4, 1500000, ["Beachfront", "Pool", "Decoration", "Relax"]),
            ("Anya Premier Hotel Quy Nhon", "44 An Duong Vuong", 5, 1800000, ["City Center", "Beach Access", "Pool", "Modern"]),
            ("Ky Co Peninsula Resort", "Nhon Ly", 4, 1600000, ["Near Ky Co", "View", "Pool", "New"]),
            ("Fleur De Lys Hotel Quy Nhon", "16 Nguyen Hue", 4, 1400000, ["Sea View", "Rooftop Bar", "Pool", "Central"])
        ]
    }, # Stop here and add remaining with generic pattern if getting too long, but these are 13. Need 5 more.
    {
        "id": "ninhbinh", "name": "Ninh Bình", "lat": 20.2506, "lon": 105.9744,
        "desc": "Vùng đất cố đô Hoa Lư với Tràng An, Tam Cốc đẹp như tranh vẽ.",
        "hotels": [
            ("Emeralda Resort Ninh Binh", "Van Long Reserve", 5, 2800000, ["Village Style", "Green", "Indoor Pool", "Bike Rental"]),
            ("Ninh Binh Hidden Charm Hotel & Resort", "Tam Coc", 4, 1600000, ["Near Tam Coc", "Pool", "Spa", "Garden"]),
            ("Tam Coc Garden Resort", "Hai Nham, Ninh Hai", 4, 2500000, ["Rice Fields", "Quiet", "Eco", "Pool"]),
            ("Mua Caves Ecolodge", "Khe Ha, Ninh Xuan", 3, 1200000, ["Create View", "Climbing", "Rustic", "Garden"]),
            ("The Reed Hotel", "Dinh Dien", 4, 1000000, ["City Center", "Convention", "Lake View", "Modern"]),
            ("Lalita Boutique Hotel & Spa", "Tam Coc", 4, 1100000, ["Decor", "Pool", "Friendly", "New"]),
            ("Bai Dinh Garden Resort", "Gia Sinh", 4, 1400000, ["Near Pagoda", "Vegetarian", "Peaceful", "Pool"])
        ]
    },
    {
        "id": "cantho", "name": "Cần Thơ", "lat": 10.0452, "lon": 105.7469,
        "desc": "Tây Đô sông nước với chợ nổi Cái Răng, bến Ninh Kiều và vườn trái cây trĩu quả.",
        "hotels": [
            ("Azerai Can Tho", "Con Au Islet", 5, 6000000, ["Private Islet", "Luxury", "River View", "Spa"]),
            ("Victoria Can Tho Resort", "Cai Khe Ward", 4, 2500000, ["Colonial", "River View", "Garden", "Boat Trip"]),
            ("Muong Thanh Luxury Can Tho", "Cai Khe Islet", 5, 1500000, ["Highest Building", "River View", "Pool", "Sky Bar"]),
            ("TTC Hotel - Can Tho", "2 Hai Ba Trung", 4, 1200000, ["Right at Ninh Kieu", "City View", "Pool", "Busy"]),
            ("Iris Hotel Can Tho", "224 30/4", 4, 900000, ["City Center", "Sky Bar", "Modern", "Clean"]),
            ("Vinpearl Hotel Can Tho", "209 30/4", 5, 1800000, ["Shopping Mall Center", "Pool", "Luxury", "View"]),
            ("Nam Bo Boutique Hotel", "1 Ngo Quyen", 4, 1800000, ["Riverfront", "Suite Only", "Classic", "Restaurant"])
        ]
    },
    {
        "id": "haiphong", "name": "Hải Phòng", "lat": 20.8449, "lon": 106.6881,
        "desc": "Thành phố cảng sầm uất với hoa phượng đỏ, Đồ Sơn và ẩm thực đường phố độc đáo.",
        "hotels": [
             ("Hotel Nikko Hai Phong", "1 Road 1, Waterfront City", 5, 2200000, ["Japanese Style", "Pool", "Onsen", "Clean"]),
             ("Vinpearl Hotel Imperia Hai Phong", "Vinhomes Imperia", 5, 2000000, ["Tallest Tower", "City View", "Pool", "Mall"]),
             ("Mercure Hai Phong", "12 Lach Tray", 5, 1800000, ["Modern", "Pool", "Bar", "Central"]),
             ("Flamingo Cat Ba Beach Resort", "Cat Co Beams", 5, 2500000, ["Island", "Beachfront", "Sky Walk", "Architecture"]),
             ("Hôtel Perle d'Orient Cat Ba - MGallery", "Cat C 3", 5, 3000000, ["Design", "Beach", "Roof Bar", "Luxury"]),
             ("Manoir Des Arts Hotel", "64 Dien Bien Phu", 4, 1200000, ["Boutique", "Classic", "Garden", "Quiet"]),
             ("Somerset Central TD Hai Phong City", "TD Plaza", 4, 1500000, ["Apartment", "Kitchen", "Pool", "Shopping"])
        ]
    },
    {
        "id": "muine", "name": "Mũi Né", "lat": 10.9576, "lon": 108.2770,
        "desc": "Thiên đường nghỉ dưỡng với những rặng dừa thơ mộng và hoạt động lướt ván diều nổi tiếng.",
         "hotels": [
            ("Victoria Phan Thiet Beach Resort & Spa", "Km 9 Phu Hai", 4, 2200000, ["Bungalows", "Botanical Garden", "Pool", "Tennis"]),
            ("Muine Bay Resort", "Quarter 14", 4, 1500000, ["Private Beach", "Garden", "Pool", "Peaceful"]),
            ("Blue Ocean Resort", "54 Nguyen Dinh Chieu", 4, 1800000, ["Beachfront", "Pool", "Green", "Spa"]),
            ("Poshanu Resort", "Quarter 5", 4, 1600000, ["Cham Style", "Seaview", "Pool", "Relax"]),
            ("Sunny Beach Resort & Spa", "64-66 Nguyen Dinh Chieu", 4, 1200000, ["Beachfront", "Pool", "Bar", "Garden"]),
            ("Cliff Resort & Residences", "Zone 5", 4, 2000000, ["Ocean View", "Apartments", "Resort", "Cinema"]),
            ("Romana Resort & Spa", "Km 8", 4, 1300000, ["Hillside", "Private Pools", "Tennis", "View"])
        ]
    },
    {
        "id": "condao", "name": "Côn Đảo", "lat": 8.6823, "lon": 106.6072,
        "desc": "Hòn đảo linh thiêng, hoang sơ với những bãi biển tuyệt mỹ và hệ sinh thái đa dạng.",
        "hotels": [
            ("Six Senses Con Dao", "Dat Doc Beach", 5, 20000000, ["Ultimate Luxury", "Private Pool", "Secluded", "Eco"]),
            ("Poulo Condor Boutique Resort & Spa", "Suoi Ot", 4, 4500000, ["French Colonial", "Garden", "Pool", "Quiet"]),
            ("The Secret Con Dao", "8 Ton Duc Thang", 4, 2500000, ["Heritage", "Sea View", "Pool", "Central"]),
            ("Marina Bay Con Dao Hotel", "Nguyen Hue", 4, 1800000, ["Ocean View", "Rooftop Pool", "Modern", "Clean"]),
            ("Con Dao Resort", "8 Nguyen Duc Thuan", 3, 1500000, ["Beachfront", "Pool", "Classic", "Simple"]),
            ("Tan Son Nhat Con Dao Resort", "6 Nguyen Duc Thuan", 3, 1200000, ["Beach Access", "Wooden", "Garden", "Restaurant"]),
            ("Orson Hotel & Resort Con Dao", "Ben Dam", 4, 1600000, ["Remote", "Private Beach", "Pool", "Mountain View"])
        ]
    }
]

# Using unsplash specific keywords for variety
general_keywords = [
    "hotel", "luxury", "resort", "bedroom", "suite", 
    "swimming pool", "lobby", "restaurant", "hotel room", "travel"
]

data = {"destinations": []}

for dest in destinations:
    dest_data = {
        "id": dest["id"],
        "name": dest["name"],
        "description": dest["desc"],
        "latitude": dest["lat"],
        "longitude": dest["lon"],
        "hotels": []
    }
    
    for i, (name, addr, stars, price, amenities) in enumerate(dest["hotels"]):
        # Generate some variations
        reviews = random.randint(50, 2000)
        rating = round(random.uniform(3.5, 5.0), 1)
        
        # Coordinate jitter
        lat_jit = dest["lat"] + random.uniform(-0.02, 0.02)
        lon_jit = dest["lon"] + random.uniform(-0.02, 0.02)
        
        # Unsplash Image (using source.unsplash.com pattern as requested, though it's deprecated/redirects, 
        # it is what user asked for. We might want to use images.unsplash.com with search terms for better stability if this was real prod)
        # However, to be safe and varied:
        
        keyword = name.split()[0] # Use first word of hotel name
        if keyword in ["The", "A", "La"]:
            keyword = "Hotel"
            
        img_url = f"https://source.unsplash.com/800x600/?hotel,{dest['id']}" 
        
        hotel_data = {
            "id": f"{dest['id']}_{i+1}",
            "name": name,
            "address": f"{addr}, {dest['name']}",
            "star_rating": stars,
            "price": price,
            "amenities": amenities,
            "description": f"Experience luxury and comfort at {name}. Located in the heart of {dest['name']}, we offer world-class services including {', '.join(amenities[:3])}. Whether you are travelling for business or leisure, our hotel is the perfect choice for your stay.",
            "image": img_url,
            "latitude": lat_jit,
            "longitude": lon_jit,
            "rating": rating,
            "reviews": reviews
        }
        dest_data["hotels"].append(hotel_data)
        
    data["destinations"].append(dest_data)

# Write to file
with open("backend/data/vietnam_hotels.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("JSON dataset generated at backend/data/vietnam_hotels.json")
