"""
MASSIVE HOTEL EXPANSION SCRIPT
Expands from 13 hotels to ~80 hotels across 16 Vietnam destinations
Each destination will have 5-6 hotels with 2 rooms each

Chay: python expand_hotels_massive.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel, Room
from datetime import datetime


# Hotel data for expansion - organized by destination
HOTEL_EXPANSION_DATA = {
    # ===== EXPAND EXISTING DESTINATIONS =====
    "Ha Noi": [
        {
            "name": "Hilton Hanoi Opera",
            "description": "Khach san sang trong gan Nha hat Lon, kien truc hien dai ket hop co dien.",
            "address": "1 Le Thanh Tong, Hoan Kiem",
            "latitude": 21.0239,
            "longitude": 105.8545,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1611892440504-42a792e24d32"],
            "amenities": ["Pool", "Spa", "Restaurant", "Bar", "Gym"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Sheraton Hanoi Hotel",
            "description": "Khach san 5 sao ben ho Tay, view hoang hon tuyet dep.",
            "address": "K5 Nghi Tam, Tay Ho",
            "latitude": 21.0607,
            "longitude": 105.8356,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1564501049412-61c2a3083791"],
            "amenities": ["Lake View", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "InterContinental Hanoi Westlake",
            "description": "Resort tren mat ho Tay, binh yen va lang man.",
            "address": "5 Tu Hoa, Tay Ho",
            "latitude": 21.0624,
            "longitude": 105.8331,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"],
            "amenities": ["Lake View", "Spa", "Pool", "Fine Dining"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "JW Marriott Hotel Hanoi",
            "description": "Khach san cao cap voi thiet ke hien dai, gan trung tam.",
            "address": "8 Do Duc Duc, Me Tri",
            "latitude": 21.0078,
            "longitude": 105.7794,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Pool", "Gym", "Spa", "Restaurant", "Bar"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Ho Chi Minh": [
        {
            "name": "Park Hyatt Saigon",
            "description": "Khach san hang sang ben Nha hat Thanh pho, kien truc Phap co dien.",
            "address": "2 Lam Son Square, District 1",
            "latitude": 10.7769,
            "longitude": 106.7019,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Pool", "Spa", "Fine Dining", "Bar"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "The Reverie Saigon",
            "description": "Khach san sieu sang trong voi thiet ke Italian co dien, view toan canh thanh pho.",
            "address": "Times Square Building, District 1",
            "latitude": 10.7795,
            "longitude": 106.7011,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Rooftop Pool", "Spa", "Italian Restaurant", "Lounge"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Caravelle Saigon",
            "description": "Khach san lich su voi hon 60 nam tuoi, view dep trong long thanh pho.",
            "address": "19 Lam Son Square, District 1",
            "latitude": 10.7770,
            "longitude": 106.7024,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Rooftop Bar", "Pool", "Restaurant", "Gym"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Hotel des Arts Saigon",
            "description": "Boutique hotel sang trong voi nghe thuat hien dai.",
            "address": "76-78 Nguyen Thi Minh Khai, District 3",
            "latitude": 10.7767,
            "longitude": 106.6918,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Rooftop Pool", "Art Gallery", "Restaurant", "Bar"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Da Nang": [
        {
            "name": "Pullman Danang Beach Resort",
            "description": "Resort bien voi kien truc hien dai, gan bien My Khe.",
            "address": "Vo Nguyen Giap, Ngu Hanh Son",
            "latitude": 16.0210,
            "longitude": 108.2526,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
            "amenities": ["Private Beach", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Hyatt Regency Danang Resort",
            "description": "Resort cao cap voi kien truc truyen thong Viet, gan Ngu Hanh Son.",
            "address": "5 Truong Sa, Hoa Hai",
            "latitude": 15.9917,
            "longitude": 108.2637,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Beach Access", "Spa", "Pool", "Golf Course"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Four Points by Sheraton Danang",
            "description": "Khach san hien dai view song Han, gan trung tam.",
            "address": "118-120 Vo Nguyen Giap",
            "latitude": 16.0394,
            "longitude": 108.2269,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["River View", "Pool", "Restaurant", "Bar"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Novotel Danang Premier Han River",
            "description": "Khach san ven song voi view Cau Rong va Cau Tinh Yeu.",
            "address": "36 Bach Dang, Hai Chau",
            "latitude": 16.0661,
            "longitude": 108.2218,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"],
            "amenities": ["River View", "Rooftop Pool", "Restaurant", "Gym"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Hoi An": [
        {
            "name": "Four Seasons The Nam Hai",
            "description": "Resort xa xi ben bien Ha My, kien truc sang trong.",
            "address": "Block Ha My Dong B, Dien Ban",
            "latitude": 15.9397,
            "longitude": 108.3066,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Beach Access", "Spa", "Pool", "Fine Dining"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Boutique Hoi An Resort",
            "description": "Resort am cung gan pho co, thiet ke truyen thong.",
            "address": "34 Lac Long Quan, Cam Chau",
            "latitude": 15.8801,
            "longitude": 108.3251,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Pool", "Restaurant", "Bicycle", "Garden"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Little Riverside Hoi An",
            "description": "Boutique hotel ven song voi phong canh dep.",
            "address": "40 Nguyen Phuc Chu, Cam Pho",
            "latitude": 15.8813,
            "longitude": 108.3311,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["River View", "Restaurant", "Bicycle"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Hoi An Silk Village Resort",
            "description": "Resort giua cay xanh, yenbinh va lang man.",
            "address": "Cu Dai Village, Hoi An",
            "latitude": 15.8657,
            "longitude": 108.3098,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
            "amenities": ["Pool", "Spa", "Garden", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Nha Trang": [
        {
            "name": "InterContinental Nha Trang",
            "description": "Resort bien cao cap voi kien truc hien dai, view vinh Nha Trang.",
            "address": "32-34 Tran Phu, Nha Trang",
            "latitude": 12.2368,
            "longitude": 109.1949,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach Access", "Infinity Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Sheraton Nha Trang Hotel",
            "description": "Khach san cao tang view toan canh bien va nui.",
            "address": "26-28 Tran Phu, Nha Trang",
            "latitude": 12.2394,
            "longitude": 109.1955,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Rooftop Pool", "Spa", "Restaurant", "Bar"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Mia Resort Nha Trang",
            "description": "Resort boutique sang trong tren doi, view bien tuyet dep.",
            "address": "Bai Dong, Cam Hai Dong",
            "latitude": 12.3756,
            "longitude": 109.2354,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Beach Access", "Infinity Pool", "Spa", "Fine Dining"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Havana Nha Trang Hotel",
            "description": "Khach san ven bien phong cach Cuba.",
            "address": "38 Tran Phu, Nha Trang",
            "latitude": 12.2343,
            "longitude": 109.1944,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Beach View", "Pool", "Restaurant", "Bar"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Da Lat": [
        {
            "name": "Ana Mandara Villas Dalat Resort",
            "description": "Villa co dien Phap tren doi thong, lang man va yenbinh.",
            "address": "Le Lai Street, Ward 5",
            "latitude": 11.9357,
            "longitude": 108.4220,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Villa", "Fireplace", "Garden", "Spa"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Terracotta Hotel Dalat",
            "description": "Khach san boutique voi thiet ke nghe thuat doc dao.",
            "address": "Ph Hung Vuong, Ward 10",
            "latitude": 11.9449,
            "longitude": 108.4412,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Art Gallery", "Restaurant", "Garden"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Swiss-Belresort Tuyen Lam Dalat",
            "description": "Resort ben ho Tuyen Lam, view thien nhien tuyet dep.",
            "address": "Zone 7&8, Tuyen Lam Lake",
            "latitude": 11.9115,
            "longitude": 108.4576,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Lake View", "Pool", "Restaurant", "Kayaking"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Sammy Dalat Hotel",
            "description": "Khach san hien dai gan cho Da Lat va ho Xuan Huong.",
            "address": "179 3 Thang 2, Ward 1",
            "latitude": 11.9437,
            "longitude": 108.4403,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["City View", "Restaurant", "Free WiFi"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Phu Quoc": [
        {
            "name": "Mango Bay Resort",
            "description": "Eco resort yenbinh voi bungalow go gan bien.",
            "address": "Ong Lang Beach",
            "latitude": 10.2573,
            "longitude": 103.9571,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Beach Access", "Eco-Friendly", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "La Veranda Resort Phu Quoc",
            "description": "Resort phong cach Indochine ben bien Long Beach.",
            "address": "Tran Hung Dao, Duong Dong",
            "latitude": 10.2187,
            "longitude": 103.9636,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
            "amenities": ["Beach Front", "Pool", "Spa", "Fine Dining"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Salinda Resort Phu Quoc",
            "description": "Resort cao cap voi ho boi lon ben bien.",
            "address": "Cua Lap, Duong To",
            "latitude": 10.2865,
            "longitude": 103.9754,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Private Beach", "Infinity Pool", "Spa"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Sapa": [
        {
            "name": "Topas Ecolodge Sapa",
            "description": "Ecolodge tren doi cao, view ruong bac thang tuyet dep.",
            "address": "Hoang Lien Commune",
            "latitude": 22.3876,
            "longitude": 103.8236,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Mountain View", "Trekking", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Sapa Jade Hill Resort",
            "description": "Resort sang trong voi view thung lung va Fansipan.",
            "address": "Muong Hoa Valley",
            "latitude": 22.3201,
            "longitude": 103.8147,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Valley View", "Infinity Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Victoria Sapa Resort",
            "description": "Resort phong cach Thuy Si giua nui doi Sapa.",
            "address": "Xuan Vien, Sapa Town",
            "latitude": 22.3364,
            "longitude": 103.8402,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Mountain View", "Fireplace", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Pao's Sapa Leisure Hotel",
            "description": "Khach san hien dai trong long thi tran Sapa.",
            "address": "06 Muong Hoa, Sapa Town",
            "latitude": 22.3358,
            "longitude": 103.8437,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Town View", "Restaurant", "Gym"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    "Ha Long": [
        {
            "name": "Novotel Ha Long Bay",
            "description": "Khach san hien dai gan ben tau, view vinh dep.",
            "address": "Ha Long Road, Bai Chay",
            "latitude": 20.9563,
            "longitude": 107.0637,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
            "amenities": ["Bay View", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Wyndham Legend Halong Hotel",
            "description": "Khach san cao tang view toan canh vinh Ha Long.",
            "address": "No.12 Ha Long, Bai Chay",
            "latitude": 20.9545,
            "longitude": 107.0681,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Panoramic View", "Infinity Pool", "Spa"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Royal Lotus Halong Resort",
            "description": "Resort am cung ben vinh, yenbinh va sang trong.",
            "address": "Tuan Chau Island",
            "latitude": 20.9454,
            "longitude": 107.0443,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach Access", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Halong Pearl Hotel",
            "description": "Khach san gan trung tam, view vinh tuyet dep.",
            "address": "Zone 2, Bai Chay",
            "latitude": 20.9571,
            "longitude": 107.0621,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Bay View", "Restaurant", "Free WiFi"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
    ],
    # ===== NEW DESTINATIONS =====
    "Vung Tau": [
        {
            "name": "Imperial Hotel Vung Tau",
            "description": "Khach san cao cap view bien Bai Truoc, gan trung tam thanh pho.",
            "address": "159 Thuy Van, Vung Tau",
            "latitude": 10.3418,
            "longitude": 107.0848,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach View", "Pool", "Restaurant", "Spa"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Pullman Vung Tau",
            "description": "Resort bien sang trong voi kien truc hien dai.",
            "address": "01 Le Loi, Vung Tau",
            "latitude": 10.3454,
            "longitude": 107.0881,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Beach Access", "Infinity Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "The Grand Ho Tram Strip",
            "description": "Resort casino lon nhat Viet Nam, xa xi va hien dai.",
            "address": "Phuoc Thuan, Xuyen Moc, Ba Ria",
            "latitude": 10.4517,
            "longitude": 107.2833,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Casino", "Beach", "Golf", "Pool", "Spa"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Alma Oasis Long Hai",
            "description": "Resort bien yenbinh tai Long Hai.",
            "address": "1 Tran Phu, Long Hai",
            "latitude": 10.3823,
            "longitude": 107.2176,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Beach Access", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Tropicana Beach Resort",
            "description": "Resort voi bai bien rieng, thiet ke nhiet doi.",
            "address": "5A Thuy Van, Vung Tau",
            "latitude": 10.3401,
            "longitude": 107.0839,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"],
            "amenities": ["Private Beach", "Pool", "Restaurant", "Garden"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Hue": [
        {
            "name": "Azerai La Residence Hue",
            "description": "Khach san lich su ven song Huong, kien truc thuc dan Phap.",
            "address": "5 Le Loi, Hue",
            "latitude": 16.4585,
            "longitude": 107.5837,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["River View", "Spa", "Fine Dining", "Pool"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Pilgrimage Village Boutique Resort",
            "description": "Resort boutique giua cay xanh, kien truc lang que Viet.",
            "address": "130 Minh Mang, Huong Thuy",
            "latitude": 16.4378,
            "longitude": 107.5621,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Garden", "Spa", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Vedana Lagoon Resort",
            "description": "Resort sang trong ben dam Lap An, view thien nhien tuyet dep.",
            "address": "Zone 2, Phong My, Phu Loc",
            "latitude": 16.3179,
            "longitude": 107.7833,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Lagoon View", "Spa", "Water Activities", "Pool"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Indochine Palace Hue",
            "description": "Khach san sang trong phong cach Indochine, gan Dai Noi.",
            "address": "105A Hung Vuong, Hue",
            "latitude": 16.4669,
            "longitude": 107.5882,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Pool", "Spa", "Restaurant", "Bar"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Muong Thanh Grand Hue Hotel",
            "description": "Khach san hien dai view song Huong va Dai Noi.",
            "address": "24-26 Bui Thi Xuan, Hue",
            "latitude": 16.4614,
            "longitude": 107.5886,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["River View", "Pool", "Restaurant", "Gym"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Quy Nhon": [
        {
            "name": "AVANI Quy Nhon Resort",
            "description": "Resort bien hien dai voi view vinh Quy Nhon tuyet dep.",
            "address": "Bai Dai Beach, Ghenh Rang",
            "latitude": 13.7599,
            "longitude": 109.2428,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Private Beach", "Infinity Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Maia Resort Quy Nhon",
            "description": "Resort boutique sang trong ben bien vang cat trang.",
            "address": "Bai Bau, Ghenh Rang",
            "latitude": 13.715,
            "longitude": 109.2354,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach Access", "Pool", "Spa", "Fine Dining"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Seasing Boutique Hotel Quy Nhon",
            "description": "Khach san boutique ngay trung tam bien Quy Nhon.",
            "address": "18 Nguyen Hue, Quy Nhon",
            "latitude": 13.7678,
            "longitude": 109.2257,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Beach View", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "FLC Luxury Resort Quy Nhon",
            "description": "Resort lon voi san golf va bai bien rieng.",
            "address": "Xuan Dai Bay, Tuy Phuoc",
            "latitude": 13.9124,
            "longitude": 109.3157,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Golf Course", "Private Beach", "Pool", "Spa"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Life Wellness Resort Quy Nhon",
            "description": "Resort tap trung vao suc khoe va thien nhien.",
            "address": "Bai Dai, Ghenh Rang",
            "latitude": 13.7512,
            "longitude": 109.2401,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Beach Access", "Yoga", "Spa", "Organic Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Can Tho": [
        {
            "name": "Victoria Can Tho Resort",
            "description": "Resort ven song Hau voi kien truc thuong dan Phap.",
            "address": "Cai Khe Ward, Ninh Kieu",
            "latitude": 10.0334,
            "longitude": 105.7877,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["River View", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Vinpearl Hotel Can Tho",
            "description": "Khach san cao tang view toan canh song va thanh pho.",
            "address": "209 30 Thang 4, Xuan Khanh",
            "latitude": 10.0271,
            "longitude": 105.7712,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Panoramic View", "Infinity Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Nam Bo Boutique Hotel",
            "description": "Boutique hotel am cung trong long mien Tay.",
            "address": "1 Ngo Gia Tu, Tan An",
            "latitude": 10.0301,
            "longitude": 105.7821,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Garden", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Holiday 2 Hotel Can Tho",
            "description": "Khach san hien dai gan cho noi Cai Rang.",
            "address": "58-60 Nguyen An Ninh, Cai Khe",
            "latitude": 10.0298,
            "longitude": 105.7841,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Pool", "Restaurant", "Free WiFi"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Muong Thanh Luxury Can Tho Hotel",
            "description": "Khach san sang trong gan trung tam.",
            "address": "2 Hai Ba Trung, Tan An",
            "latitude": 10.0312,
            "longitude": 105.7798,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Pool", "Spa", "Restaurant", "Gym"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Ninh Binh": [
        {
            "name": "Emeralda Ninh Binh Resort",
            "description": "Resort sang trong giua thien nhien Tam Coc.",
            "address": "Van Lang, Hoa Lu",
            "latitude": 20.2479,
            "longitude": 105.9102,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Mountain View", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Tam Coc Garden Resort",
            "description": "Resort am cung giua dong lua va nui da.",
            "address": "Hai Nham, Hoa Lu",
            "latitude": 20.2501,
            "longitude": 105.9123,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Garden", "Pool", "Bicycle", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Ninh Binh Hidden Charm Hotel",
            "description": "Khach san boutique với view ruong lua xanh mat.",
            "address": "Van Lam, Ninh Hai",
            "latitude": 20.2412,
            "longitude": 105.9087,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Rice Field View", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Chez Loan Hotel Ninh Binh",
            "description": "Khach san gia dinh am cung tai Tam Coc.",
            "address": "Tam Coc, Hoa Lu",
            "latitude": 20.2488,
            "longitude": 105.9110,
            "star_rating": 3,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Garden", "Restaurant", "Bicycle Rental"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "TAM COC BUNGALOW",
            "description": "Bungalow yenbinh giua thien nhien Tam Coc.",
            "address": "Van Lam Village, Ninh Hai",
            "latitude": 20.2467,
            "longitude": 105.9098,
            "star_rating": 3,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Nature View", "Garden", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Mui Ne": [
        {
            "name": "Anantara Mui Ne Resort",
            "description": "Resort sang trong ben bien voi doi cat trang.",
            "address": "Nguyen Dinh Chieu, Ham Tien",
            "latitude": 10.9328,
            "longitude": 108.2865,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Beach Access", "Pool", "Spa", "Fine Dining"],
            "policies": {
                "check_in": "15:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Mia Resort Mui Ne",
            "description": "Resort boutique voi kien truc dac sac ben bien.",
            "address": "24 Nguyen Dinh Chieu, Ham Tien",
            "latitude": 10.9401,
            "longitude": 108.2912,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach Front", "Pool", "Spa", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Seahorse Resort Mui Ne",
            "description": "Resort gia dinh am cung ngay ben bien.",
            "address": "118 Nguyen Dinh Chieu, Ham Tien",
            "latitude": 10.9365,
            "longitude": 108.2889,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Beach Access", "Pool", "Restaurant", "Kite Surfing"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Blue Ocean Resort Mui Ne",
            "description": "Resort voi bungalow ben bien, phong cach nhiet doi.",
            "address": "56 Nguyen Dinh Chieu, Ham Tien",
            "latitude": 10.9387,
            "longitude": 108.2901,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Beach Front", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Pandanus Resort Mui Ne",
            "description": "Resort yenbinh voi vuon xanh mat ben bien.",
            "address": "97 Nguyen Dinh Chieu, Ham Tien",
            "latitude": 10.9354,
            "longitude": 108.2876,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Garden", "Beach Access", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
    "Con Dao": [
        {
            "name": "Six Senses Con Dao",
            "description": "Resort xa xi nhat Con Dao voi villa rieng bien tuyet dep.",
            "address": "Dat Doc Beach, Con Dao",
            "latitude": 8.6895,
            "longitude": 106.6092,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
            "amenities": ["Private Beach", "Villa", "Spa", "Fine Dining", "Diving"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Poulo Condor Boutique Resort",
            "description": "Resort boutique sang trong ben bien hoang so.",
            "address": "8 Nguyen Duc Thanh, Con Dao",
            "latitude": 8.6854,
            "longitude": 106.6048,
            "star_rating": 5,
            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
            "amenities": ["Beach Access", "Pool", "Restaurant", "Diving Center"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Sai Gon Con Dao Resort",
            "description": "Resort voi bungalow ben bien xinh xan.",
            "address": "18-24 Ton Duc Thang, Con Dao",
            "latitude": 8.6871,
            "longitude": 106.6065,
            "star_rating": 4,
            "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
            "amenities": ["Beach View", "Pool", "Restaurant"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
        {
            "name": "Con Dao Resort",
            "description": "Resort gan bien voi thiet ke don gian nhung am cung.",
            "address": "Nguyen An Ninh, Con Dao",
            "latitude": 8.6882,
            "longitude": 106.6071,
            "star_rating": 3,
            "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
            "amenities": ["Beach Access", "Restaurant", "Free WiFi"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 48 hours",
            },
        },
        {
            "name": "Mai Linh Con Dao Resort",
            "description": "Resort gia ca phai chang ben bien dep.",
            "address": "Bai Nhat, Con Dao",
            "latitude": 8.6912,
            "longitude": 106.6103,
            "star_rating": 3,
            "images": ["https://images.unsplash.com/photo-1571896349842-6e53ce41e887"],
            "amenities": ["Beach Access", "Restaurant", "Bicycle Rental"],
            "policies": {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free cancellation up to 24 hours",
            },
        },
    ],
}

# Note: This is abbreviated - will create full script with ALL destinations and 5-6 hotels each
# Total will be ~70 hotelswith rooms


def expand_hotels():
    """
    Main function to add all expansion hotels and their rooms
    """
    db = SessionLocal()

    try:
        print("=" * 60)
        print("MASSIVE HOTEL EXPANSION - Phase 1: Adding Hotels")
        print("=" * 60)

        hotels_added = 0
        rooms_added = 0

        # Process each destination
        for city, hotels_list in HOTEL_EXPANSION_DATA.items():
            print(f"\n[{city}] Adding {len(hotels_list)} hotels...")

            for hotel_data in hotels_list:
                # Check if hotel already exists
                existing = (
                    db.query(Hotel).filter(Hotel.name == hotel_data["name"]).first()
                )
                if existing:
                    print(f"  [SKIP] {hotel_data['name']} already exists")
                    hotel = existing
                else:
                    # Add new hotel
                    hotel = Hotel(
                        name=hotel_data["name"],
                        description=hotel_data["description"],
                        address=hotel_data["address"],
                        city=city,
                        country="Vietnam",
                        latitude=hotel_data["latitude"],
                        longitude=hotel_data["longitude"],
                        star_rating=hotel_data["star_rating"],
                        images=hotel_data["images"],
                        amenities=hotel_data["amenities"],
                        policies=hotel_data["policies"],
                    )
                    db.add(hotel)
                    db.flush()  # Get hotel ID
                    hotels_added += 1
                    print(f"  [ADD] {hotel_data['name']}")

                # Add 2 rooms per hotel
                # Use existing room images
                room_images = [
                    "/rooms/deluxe_ocean_view_1769786499296.png",
                    "/rooms/ocean_suite_1769786517001.png",
                    "/rooms/superior_city_view_1769786533906.png",
                    "/rooms/executive_suite_1769786549773.png",
                    "/rooms/deluxe_river_view_1769786577151.png",
                    "/rooms/family_room_1769786596501.png",
                    "/rooms/deluxe_garden_view_1769786613988.png",
                    "/rooms/beach_villa_1769786630195.png",
                ]

                # Check if rooms already exist for this hotel
                existing_rooms = (
                    db.query(Room).filter(Room.hotel_id == hotel.id).count()
                )
                if existing_rooms >= 2:
                    print(f"    [SKIP] Rooms already exist for this hotel")
                    continue

                # Add 2 rooms
                base_price = (
                    2000000
                    if hotel.star_rating == 3
                    else 3500000 if hotel.star_rating == 4 else 5500000
                )

                room1 = Room(
                    hotel_id=hotel.id,
                    name="Deluxe Room",
                    description=f"Phong Deluxe tai {hotel.name}",
                    room_type="Deluxe",
                    max_guests=2,
                    size=35,
                    bed_type="King",
                    base_price=base_price,
                    images=[room_images[hotels_added % len(room_images)]],
                    amenities=["WiFi", "AC", "TV", "Mini Bar"],
                )

                room2 = Room(
                    hotel_id=hotel.id,
                    name="Suite Room",
                    description=f"Phong Suite cao cap tai {hotel.name}",
                    room_type="Suite",
                    max_guests=3,
                    size=60,
                    bed_type="King + Sofa Bed",
                    base_price=int(base_price * 1.8),
                    images=[room_images[(hotels_added + 1) % len(room_images)]],
                    amenities=["WiFi", "AC", "TV", "Living Room", "Bathtub"],
                )

                db.add(room1)
                db.add(room2)
                rooms_added += 2
                print(f"    [ADD] 2 rooms")

        # Commit all changes
        db.commit()

        print("\n" + "=" * 60)
        print("EXPANSION COMPLETE!")
        print("=" * 60)
        print(f"Hotels added: {hotels_added}")
        print(f"Rooms added: {rooms_added}")

        # Show final stats
        total_hotels = db.query(Hotel).count()
        total_rooms = db.query(Room).count()
        print(f"\nTotal hotels in database: {total_hotels}")
        print(f"Total rooms in database: {total_rooms}")

        # Show hotels per city
        print("\n=== Hotels by Destination ===")
        from sqlalchemy import func

        city_counts = (
            db.query(Hotel.city, func.count(Hotel.id)).group_by(Hotel.city).all()
        )
        for city, count in sorted(city_counts, key=lambda x: x[1], reverse=True):
            print(f"{city}: {count} hotels")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    expand_hotels()
