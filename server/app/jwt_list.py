from extensions import jwt, db
from models import TokenBlocklist

@jwt.token_in_blocklist_loader
def is_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload.get("jti")
    if not jti:
        return False
    return db.session.query(TokenBlocklist.id).filter_by(jti=jti).first() is not None
