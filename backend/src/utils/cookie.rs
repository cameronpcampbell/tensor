use urlencoding::encode;

pub struct CreateCookieOptions<'a> {
    pub secure: Option<bool>,
    pub path: Option<&'a str>,
    pub http_only: Option<bool>,
    pub max_age: Option<usize>,
    pub same_site: Option<&'a str>
}

pub fn create_cookie(
  name: &str, value: &str, options: CreateCookieOptions
) -> String {
  let mut cookie_string = format!("{}={};", encode(name), encode(value));
  
  if let Some(max_age) = options.max_age { cookie_string += &format!("; max-age={}", max_age) }
  if let Some(path) = options.path { cookie_string += &format!("; path={}", path) }
  if let Some(secure) = options.secure { if secure { cookie_string += "; secure" } }
  if let Some(http_only) = options.http_only { if http_only { cookie_string += "; httpOnly" } }
  if let Some(same_site) = options.same_site { cookie_string += &format!("; same-site={}", same_site) }
  
  return cookie_string
}

pub fn delete_cookie(name: &str) -> String {
    format!("{}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT", name)
}