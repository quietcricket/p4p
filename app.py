import boto3
import os
import json
import uuid
import config
from flask import Flask, render_template, request

rek = boto3.client('rekognition',
                   aws_access_key_id=config.AWS_KEY,
                   aws_secret_access_key=config.AWS_SECRET,
                   region_name='us-west-2')

s3 = boto3.resource('s3', aws_access_key_id=config.AWS_KEY,
                    aws_secret_access_key=config.AWS_SECRET,
                    region_name='us-west-2')

app = Flask('p4p')

def delete_collection():
    response = rek.delete_collection(
    CollectionId=config.COLLECTION
    )
    print(response)

def create_collection():
    response = rek.create_collection(
    CollectionId=config.COLLECTION
    )

def search_faces(filename):
        if filename.endswith('.jpg'):
            response = rek.search_faces_by_image(
                CollectionId=config.COLLECTION,
                Image={
                    'S3Object': {
                    'Bucket': config.BUCKET,
                    'Name': filename
                    }
                },
                MaxFaces=123
            )
            if (len(response["FaceMatches"])>0):
                faceids=[]
                for fm in response["FaceMatches"]:
                    faceid=fm['Face']['FaceId']
                    faceids.append(faceid)
                return faceids
        return None


def index_face(filename):
    resp = rek.index_faces(CollectionId=config.COLLECTION, Image={
            'S3Object': {
            'Bucket': config.BUCKET,
            'Name': filename
            }
    })
    if (len(resp['FaceRecords'])>0):
        faceid=resp['FaceRecords'][0]['Face']['FaceId']
        return(faceid)
    else:
        return None
def delete_face(faceid):
    response = rek.delete_faces(
    CollectionId=config.COLLECTION,
    FaceIds=[
        faceid,
    ]
    )
def swap_dict(dic):
    newdict={}
    for k,v in dic.items():
        newdict[v]=k
    return newdict



@app.route('/')
def take_photo():
    return render_template('take-photo.html')


@app.route('/faces')
def list_faces():

    return render_template('faces.html', faces=json.load(open('faces.json')))


@app.route('/upload-photo', methods=['POST'])
def upload():
    db = json.load(open('db.json'))
    filename = uuid.uuid4().hex+'.jpg'
    if db.get(filename):
        del db[filename]
    file_obj = request.files['image']
    obj = s3.Object(config.BUCKET, filename)
    metadata = {'CacheControl': 'max-age=9999', 'ContentType': 'image/jpeg'}
    obj.upload_fileobj(file_obj, ExtraArgs=metadata)
    obj.Acl().put(ACL='public-read')
    # Read faces.json
    faces = json.load(open('faces.json'))
    # Build dictionary of {"id":"name"}
    swap_faces=swap_dict(faces) 
    # Call rekognition to detect faces
    faceids=search_faces(filename)
    # for each face id, get the name of the face
    names=[]
    for ids in faceids:
        facename=swap_faces[ids]
        names.append(facename)
    db[filename]={"faces":names}
    # save db.json
    json.dump(db, open('db.json', 'w'), indent=2)
    return 'ok'


@app.route('/update-face', methods=['POST'])
def update_face():
    faces = json.load(open('faces.json'))
    name = request.form['name']
    filename = name+'.jpg'
    file_obj = request.files['image']
    obj = s3.Object(config.BUCKET, filename)
    metadata = {'CacheControl': 'max-age=9999', 'ContentType': 'image/jpeg'}
    obj.upload_fileobj(file_obj, ExtraArgs=metadata)
    obj.Acl().put(ACL='public-read')
    if name in faces:
        del faces[name]     # delete old faceid
        delete_face(faces[name])
    faceid=index_face(filename)# call rekognition to index face
    # save face id
    # update faces.json
    # save it
    if faceid is not None:
        faces[name]=faceid
    json.dump(faces, open('faces.json', 'w'), indent=2)
    return 'ok'


@app.route('/add-face')
def add_face():
    return render_template('add-face.html')


@app.route('/my-photos', methods=['GET', 'POST'])
def find_photos():
    if request.method == 'GET':
        return render_template('my-photos.html')
    name = request.args.get('name')
    db = json.load(open('db.json'))
    photos = []
    for filename, obj in db:
        if name in obj['faces']:
            photos.push(filename)
    return photos.join(",")


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.run(port=8080, debug=True)
