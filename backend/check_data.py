import json

# Load the data
with open('hotels_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Print statistics
print(f'Tổng số địa điểm: {len(data["destinations"])}')
print(f'Tổng số khách sạn: {sum(len(d["hotels"]) for d in data["destinations"])}')

print('\nĐịa điểm:')
for dest in data['destinations']:
    print(f'  - {dest["name"]}: {len(dest["hotels"])} khách sạn')
