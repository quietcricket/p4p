
def upload_photos():
    for f in os.listdir('photos'):
        s3.upload_file('photos/%s' % f, BUCKET, f)


def index_faces():
    for filename in os.listdir('photos'):
        resp = rek.index_faces(CollectionId=COLLECTION, Image={
            'S3Object': {
                'Bucket': BUCKET,
                'Name': filename
            }
        })
        json.dump(resp, open('data/%s.json' % filename, 'w'), indent=2)


def read_faces():
    faces = {}
    for filename in os.listdir('photos'):
        data = json.load(open('data/%s.json' % filename))
        for fr in data['FaceRecords']:
            fid = fr['Face']['FaceId']
            faces.setdefault(fid, 0)
            faces[fid] += 1


@app.route('/test-photos')
def list_photos():
    photos = []
    for filename in os.listdir('static/photos'):
        p = {'filename': filename, 'faces': []}
        data = json.load(open('data/%s.json' % filename))
        for fr in data['FaceRecords']:
            face = {'fid': fr['Face']['FaceId']}
            face['box'] = fr['FaceDetail']['BoundingBox']
            p['faces'].append(face)
        photos.append(p)
    return render_template('list-photos.html', photos=photos)
