import requests

url = "https://xtension.onrender.com/build_embeddings"
headers = {
    "Content-Type": "application/json"
}
data = {
    "owner": "octocat",
    "repo": "Hello-World"
}

response = requests.post(url, headers=headers, json=data)

print("Status Code:", response.status_code)
print("Response Body:", response.text)
